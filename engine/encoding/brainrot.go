// Package encoding provides the version-one Brainrot wire encoding.
// Encoding is reversible presentation, not encryption.
package encoding

import (
	"fmt"
	"strings"
)

// Each byte becomes two words (high nibble, then low nibble).
// This vocabulary and its ordering are part of the V1 file format.
var words = [...]string{
	"rizz", "skibidi", "gyatt", "sigma",
	"ohio", "aura", "delulu", "bussin",
	"yeet", "sus", "based", "slay",
	"drip", "mewing", "goated", "bet",
}

func Encode(data []byte) string {
	tokens := make([]string, 0, len(data)*2)
	for _, b := range data {
		tokens = append(tokens, words[b>>4], words[b&15])
	}
	return strings.Join(tokens, " ")
}

func Decode(text string) ([]byte, error) {
	tokens := strings.Fields(text)
	if len(tokens)%2 != 0 {
		return nil, fmt.Errorf("brainrot: expected pairs of words")
	}
	lookup := make(map[string]byte, len(words))
	for i, word := range words {
		lookup[word] = byte(i)
	}
	data := make([]byte, len(tokens)/2)
	for i := 0; i < len(tokens); i += 2 {
		hi, ok := lookup[tokens[i]]
		if !ok {
			return nil, fmt.Errorf("brainrot: invalid word at token %d", i)
		}
		lo, ok := lookup[tokens[i+1]]
		if !ok {
			return nil, fmt.Errorf("brainrot: invalid word at token %d", i+1)
		}
		data[i/2] = hi<<4 | lo
	}
	return data, nil
}
