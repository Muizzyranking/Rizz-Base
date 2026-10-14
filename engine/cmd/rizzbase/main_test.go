package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestCLI(t *testing.T) {
	path := filepath.Join(t.TempDir(), "cli.rizz")
	for _, operation := range []string{"create", "open"} {
		data, _ := json.Marshal(request{Operation: operation, Path: path, Name: "cli-demo", Passphrase: "test-only"})
		var out bytes.Buffer
		if err := run(bytes.NewReader(data), &out); err != nil {
			t.Fatal(err)
		}
		var res response
		if err := json.Unmarshal(out.Bytes(), &res); err != nil || !res.OK || res.Project.Name != "cli-demo" {
			t.Fatalf("bad response: %s", out.String())
		}
		if strings.Contains(out.String(), "test-only") {
			t.Fatal("passphrase leaked into response")
		}
	}
}

func TestBadRequests(t *testing.T) {
	for _, input := range []string{
		`{`, `{}`, `null`, `{"operation":"delete"}`, `{"unknown":1}`,
		`{"operation":"create"} {}`, strings.Repeat("x", (64<<10)+1),
	} {
		var out bytes.Buffer
		if err := run(strings.NewReader(input), &out); err == nil {
			t.Fatalf("accepted bad request: %.50s", input)
		}
		if out.Len() != 0 {
			t.Fatal("success output on failure")
		}
	}
}

func TestAllOperationDispatches(t *testing.T) {
	path := filepath.Join(t.TempDir(), "not-created.rizz")
	requests := []request{
		{Operation: "lobby.create", Path: path, Name: "general", Passphrase: "test-only"},
		{Operation: "lobby.list", Path: path, Passphrase: "test-only"},
		{Operation: "lobby.delete", Path: path, LobbyID: "lobby", Passphrase: "test-only"},
		{Operation: "yap.create", Path: path, LobbyID: "lobby", YapID: "yap", Data: json.RawMessage(`true`), Passphrase: "test-only"},
		{Operation: "yap.get", Path: path, LobbyID: "lobby", YapID: "yap", Passphrase: "test-only"},
		{Operation: "yap.list", Path: path, LobbyID: "lobby", Passphrase: "test-only"},
		{Operation: "yap.update", Path: path, LobbyID: "lobby", YapID: "yap", Data: json.RawMessage(`true`), Passphrase: "test-only"},
		{Operation: "yap.delete", Path: path, LobbyID: "lobby", YapID: "yap", Passphrase: "test-only"},
	}
	for _, req := range requests {
		data, err := json.Marshal(req)
		if err != nil {
			t.Fatal(err)
		}
		var out bytes.Buffer
		err = run(bytes.NewReader(data), &out)
		if !errors.Is(err, os.ErrNotExist) {
			t.Fatalf("%s didn't reach storage: %v", req.Operation, err)
		}
	}
}
