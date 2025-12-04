package utils

import (
	"database/sql"
	"errors"
	"reflect"
	"strings"
)

func GetSelectQueryFields[T any](prefix string) string {
	var t T
	if prefix != "" {
		prefix = prefix + "."
	}
	// Get type
	typ := reflect.TypeOf(t)
	// If T is a pointer, dereference it
	if typ.Kind() == reflect.Ptr {
		typ = typ.Elem()
	}

	// Collect db rows
	var cols []string

	for i := 0; i < typ.NumField(); i++ {
		// Get the i'th field in the struct
		field := typ.Field(i)
		col := field.Tag.Get("db")
		if col == "" {
			continue // skip fields without db tag
		}
		// Add column name
		cols = append(cols, prefix+"\""+col+"\"")
	}

	return strings.Join(cols, ", ")
}

func createPtrListFromObject[T any](ptr *T, dest *[]any) error {
	// Get object in pointer
	rv := reflect.ValueOf(ptr)
	// Pointer has to be a non-nil pointer
	if rv.Kind() != reflect.Ptr || rv.IsNil() {
		return errors.New("ptr must be a non-nil pointer")
	}
	v := rv.Elem()
	// Type must be a struct
	if v.Kind() != reflect.Struct {
		return errors.New("T must be a struct")
	}
	// Get type of the pointer
	t := v.Type()

	// Collect scan destinations and column names
	for i := 0; i < t.NumField(); i++ {
		// Get the i'th field in the struct
		field := t.Field(i)
		col := field.Tag.Get("db")
		if col == "" {
			continue // skip fields without db tag
		}
		// Add pointers to fields to destinatiuons
		*dest = append(*dest, v.Field(i).Addr().Interface())
	}
	return nil
}

func SqlRowToStruct[T any](row *sql.Row, ptr *T) error {
	if ptr == nil {
		return errors.New("ptr cannot be nil")
	}

	// Collect scan destinations
	var dest []any
	err := createPtrListFromObject(ptr, &dest)
	if err != nil {
		return err
	}
	// If nothing to get
	if len(dest) == 0 {
		return errors.New("struct has no db tags")
	}
	// Direct scan
	if err := row.Scan(dest...); err != nil {
		return err
	}
	return nil
}

func SqlRowsToStructList[T any](rows *sql.Rows, lptr *[]*T) error {
	if lptr == nil {
		return errors.New("ptr cannot be nil")
	}
	defer rows.Close()

	for rows.Next() {
		// Create struct to scan into
		v := new(T)
		// Collect scan destinations
		var dest []any
		err := createPtrListFromObject(v, &dest)
		if err != nil {
			return err
		}
		// If nothing to get
		if len(dest) == 0 {
			return errors.New("struct has no db tags")
		}
		if err := rows.Scan(dest...); err != nil {
			return err
		}
		*lptr = append(*lptr, v)
	}

	return rows.Err()
}
