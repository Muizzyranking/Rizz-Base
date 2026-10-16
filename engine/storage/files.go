// Package storage persists encrypted Brainrot-encoded .rizz files.
package storage

import (
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"

	rizzcrypto "rizzbase/engine/crypto"
	"rizzbase/engine/encoding"
)

// A conservative V1 limit on the encoded file, not on decrypted document size.
const MaxFileSize = 64 << 20

var ErrBusy = errors.New("project is busy or has a stale lock; check for another writer before removing the .lock directory")

func Read(path, passphrase string) ([]byte, error) {
	if err := validatePath(path); err != nil {
		return nil, err
	}
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	info, err := f.Stat()
	if err != nil {
		return nil, err
	}
	if !info.Mode().IsRegular() {
		return nil, errors.New("project must be a regular file")
	}
	if info.Size() > MaxFileSize {
		return nil, errors.New("project exceeds the V1 file-size limit")
	}
	text, err := io.ReadAll(io.LimitReader(f, MaxFileSize+1))
	if err != nil {
		return nil, err
	}
	if len(text) > MaxFileSize {
		return nil, errors.New("project exceeds the V1 file-size limit")
	}
	envelope, err := encoding.Decode(string(text))
	if err != nil {
		return nil, err
	}
	return rizzcrypto.Open(envelope, passphrase)
}

// Create publishes a fully written file without replacing an existing project.
// Hard-link publication is atomic and requires a local filesystem that supports
// hard links. Updates and write-ahead logging are deliberately not exposed yet.
func Create(path, passphrase string, plaintext []byte) error {
	if err := validatePath(path); err != nil {
		return err
	}
	envelope, err := rizzcrypto.Seal(plaintext, passphrase)
	if err != nil {
		return err
	}
	text := encoding.Encode(envelope) + "\n"
	if len(text) > MaxFileSize {
		return errors.New("project exceeds the V1 file-size limit")
	}
	return writeAtomically(path, []byte(text), false)
}

// Modify locks one project, decrypts its current contents, runs the caller's
// mutation, then atomically replaces the file with a freshly encrypted copy.
// A pre-existing lock fails closed. After a crash, verify that no writer is
// running before manually removing the adjacent .lock directory.
func Modify(path, passphrase string, mutate func([]byte) ([]byte, error)) error {
	if err := validatePath(path); err != nil {
		return err
	}
	lockPath := path + ".lock"
	if err := os.Mkdir(lockPath, 0700); err != nil {
		if errors.Is(err, os.ErrExist) {
			return ErrBusy
		}
		return fmt.Errorf("lock project: %w", err)
	}
	defer os.Remove(lockPath)

	plaintext, err := Read(path, passphrase)
	if err != nil {
		return err
	}
	defer clear(plaintext)
	next, err := mutate(plaintext)
	if err != nil {
		return err
	}
	defer clear(next)
	envelope, err := rizzcrypto.Seal(next, passphrase)
	if err != nil {
		return err
	}
	text := []byte(encoding.Encode(envelope) + "\n")
	if len(text) > MaxFileSize {
		return errors.New("project exceeds the V1 file-size limit")
	}
	return writeAtomically(path, text, true)
}

// writeAtomically publishes a complete, synced file in the destination
// directory. create=false uses an atomic hard-link so existing files are safe.
func writeAtomically(path string, data []byte, replace bool) error {
	dir := filepath.Dir(path)
	f, err := os.CreateTemp(dir, ".rizzbase-*")
	if err != nil {
		return err
	}
	temp := f.Name()
	defer os.Remove(temp)
	defer f.Close()
	// CreateTemp uses 0600: only the owner can read/write the project on Unix.
	if _, err := f.Write(data); err != nil {
		return err
	}
	if err := f.Sync(); err != nil {
		return err
	}
	if err := f.Close(); err != nil {
		return err
	}
	if replace {
		if err := os.Rename(temp, path); err != nil {
			return fmt.Errorf("atomically replace project: %w", err)
		}
	} else if err := os.Link(temp, path); err != nil {
		return fmt.Errorf("publish project (existing files are never overwritten): %w", err)
	}
	// Windows does not support syncing directories through os.File.Sync.
	if runtime.GOOS != "windows" {
		d, err := os.Open(dir)
		if err != nil {
			return fmt.Errorf("file published but directory sync failed: %w", err)
		}
		defer d.Close()
		if err := d.Sync(); err != nil {
			return fmt.Errorf("file published but directory sync failed: %w", err)
		}
	}
	return nil
}

func validatePath(path string) error {
	if filepath.Ext(path) != ".rizz" {
		return errors.New("Invalid project path: expected a .rizz file.")
	}
	return nil
}
