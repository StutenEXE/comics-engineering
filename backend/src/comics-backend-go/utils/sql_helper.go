package utils

import (
	"database/sql"
	"errors"
	"reflect"
	"strconv"
	"strings"
)

func GetSelectQueryFields[T any](prefix string, ignore_tags ...string) string {
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
		// If some ignore tags are given, check if any is present
		ignore_tags_found := false
		for _, tag := range ignore_tags {
			if field.Tag.Get(tag) == "true" {
				ignore_tags_found = true
				break
			}
		}
		if col == "" || ignore_tags_found {
			continue // skip fields without db tag or with ignore tags
		}
		// Add column name
		cols = append(cols, prefix+"\""+col+"\"")
	}

	return strings.Join(cols, ", ")
}

func GetCreateQueryFields[T any]() string {
	// Same as for SelectQueryFields but without prefix
	return GetSelectQueryFields[T]("", "create_ignore")
}

func GetCreateQueryPlaceholders[T any]() string {
	var t T
	// Get type
	typ := reflect.TypeOf(t)
	// If T is a pointer, dereference it
	if typ.Kind() == reflect.Ptr {
		typ = typ.Elem()
	}
	// Collect placeholders (i.e. $1, $2, ...)
	placeholders := []string{}
	numOfFields := 1
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		col := field.Tag.Get("db")
		ignore := field.Tag.Get("create_ignore")
		// Ignore fields without db tag or with ignore tag
		if col == "" || ignore == "true" {
			continue
		}
		placeholders = append(placeholders, "$"+strconv.Itoa(numOfFields))
		numOfFields++
	}
	return strings.Join(placeholders, ", ")
}

func GetCreateQueryValues[T any](rowObj T) []any {
	// Get value
	rv := reflect.ValueOf(rowObj)
	// If T is a pointer, dereference it
	if rv.Kind() == reflect.Ptr {
		rv = rv.Elem()
	}
	// Get type
	typ := rv.Type()
	// Collect values
	values := []any{}
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		col := field.Tag.Get("db")
		ignore := field.Tag.Get("create_ignore")
		// Ignore fields without db tag or with ignore tag
		if col == "" || ignore == "true" {
			continue
		}
		val := rv.Field(i).Interface()
		if val != "" {
			values = append(values, val)
		} else {
			values = append(values, nil)
		}
	}
	return values
}

func GetUpdateQueryPlaceholders[T any](rowObj T) (string, int) {
	// Get value
	rv := reflect.ValueOf(rowObj)
	// If T is a pointer, dereference it
	if rv.Kind() == reflect.Ptr {
		rv = rv.Elem()
	}
	// Get type
	typ := rv.Type()
	// Collect placeholders (i.e. col1=$1, col2=$2, ...)
	placeholders := []string{}
	numOfFields := 1
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		col := field.Tag.Get("db")
		ignore := field.Tag.Get("update_ignore")
		// Ignore fields without db tag or with ignore tag
		if ignore == "true" || col == "" {
			continue
		}
		updateNow := field.Tag.Get("update_to_now")
		if updateNow != "true" {
			placeholders = append(placeholders, col+"=$"+strconv.Itoa(numOfFields))
			numOfFields++
		} else {
			placeholders = append(placeholders, col+"=NOW()")
		}
	}
	return strings.Join(placeholders, ", "), len(placeholders)
}

func GetUpdateQueryValues[T any](rowObj T) []any {
	// Get value
	rv := reflect.ValueOf(rowObj)
	// If T is a pointer, dereference it
	if rv.Kind() == reflect.Ptr {
		rv = rv.Elem()
	}
	// Get type
	typ := rv.Type()
	// Collect values
	values := []any{}
	for i := 0; i < typ.NumField(); i++ {
		field := typ.Field(i)
		col := field.Tag.Get("db")
		ignore := field.Tag.Get("update_ignore")
		ignoreNow := field.Tag.Get("update_to_now")
		// Ignore fields without db tag or with ignore tag or set to now
		if ignore == "true" || ignoreNow == "true" || col == "" {
			continue
		}
		val := rv.Field(i).Interface()
		if val != "" {
			values = append(values, val)
		} else {
			values = append(values, nil)
		}
	}
	return values
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
