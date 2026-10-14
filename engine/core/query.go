package core

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"strings"
)

// Filter compares a dot-separated object field with a JSON value.
type Filter struct {
	Field    string          `json:"field"`
	Operator string          `json:"operator"`
	Value    json.RawMessage `json:"value"`
}

// QueryOptions combines filters with AND. Nil Limit means unlimited.
type QueryOptions struct {
	Where []Filter `json:"where,omitempty"`
	Limit *int     `json:"limit,omitempty"`
}

// QueryYaps filters a snapshot in Yap-ID order, without changing the file.
// Missing fields never match, including !=. Ordering comparisons are only
// defined between two numbers or two strings, with no type coercion.
func QueryYaps(path, passphrase, lobbyID string, options QueryOptions) ([]Yap, error) {
	if options.Limit != nil && *options.Limit < 0 {
		return nil, errors.New("query limit must be non-negative")
	}
	values := make([]any, len(options.Where))
	for i, filter := range options.Where {
		for _, part := range strings.Split(filter.Field, ".") {
			if strings.TrimSpace(part) == "" {
				return nil, errors.New("query field must have non-empty path segments")
			}
		}
		switch filter.Operator {
		case "==", "!=", ">", ">=", "<", "<=":
		default:
			return nil, fmt.Errorf("unsupported query operator: %s", filter.Operator)
		}
		value, err := decodeValue(filter.Value)
		if err != nil {
			return nil, errors.New("query filter requires valid JSON value")
		}
		values[i] = value
	}
	yaps, err := ListYaps(path, passphrase, lobbyID)
	if err != nil {
		return nil, err
	}
	result := make([]Yap, 0)
	for _, yap := range yaps {
		if options.Limit != nil && len(result) >= *options.Limit {
			break
		}
		document, err := decodeValue(yap.Data)
		if err != nil {
			return nil, err
		}
		matches := true
		for i, filter := range options.Where {
			value, exists := fieldValue(document, filter.Field)
			if !exists || !compare(value, filter.Operator, values[i]) {
				matches = false
				break
			}
		}
		if matches {
			result = append(result, yap)
		}
	}
	return result, nil
}

func decodeValue(data []byte) (any, error) {
	if !json.Valid(data) {
		return nil, errors.New("invalid JSON value")
	}
	decoder := json.NewDecoder(bytes.NewReader(data))
	decoder.UseNumber()
	var value any
	err := decoder.Decode(&value)
	return value, err
}

func fieldValue(value any, field string) (any, bool) {
	for _, segment := range strings.Split(field, ".") {
		object, ok := value.(map[string]any)
		if !ok {
			return nil, false
		}
		value, ok = object[segment]
		if !ok {
			return nil, false
		}
	}
	return value, true
}

func compare(a any, operator string, b any) bool {
	if operator == "==" {
		return equalJSON(a, b)
	}
	if operator == "!=" {
		return !equalJSON(a, b)
	}
	var order int
	switch left := a.(type) {
	case json.Number:
		right, ok := b.(json.Number)
		if !ok {
			return false
		}
		l, lok := new(big.Rat).SetString(string(left))
		r, rok := new(big.Rat).SetString(string(right))
		if !lok || !rok {
			return false
		}
		order = l.Cmp(r)
	case string:
		right, ok := b.(string)
		if !ok {
			return false
		}
		order = strings.Compare(left, right)
	default:
		return false
	}
	switch operator {
	case ">":
		return order > 0
	case ">=":
		return order >= 0
	case "<":
		return order < 0
	case "<=":
		return order <= 0
	}
	return false
}

func equalJSON(a, b any) bool {
	switch left := a.(type) {
	case json.Number:
		return compare(a, ">=", b) && compare(a, "<=", b)
	case map[string]any:
		right, ok := b.(map[string]any)
		if !ok || len(left) != len(right) {
			return false
		}
		for key, value := range left {
			other, exists := right[key]
			if !exists || !equalJSON(value, other) {
				return false
			}
		}
		return true
	case []any:
		right, ok := b.([]any)
		if !ok || len(left) != len(right) {
			return false
		}
		for i, value := range left {
			if !equalJSON(value, right[i]) {
				return false
			}
		}
		return true
	default:
		return a == b
	}
}
