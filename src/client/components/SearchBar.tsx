import { useAuth } from "@/contexts/AuthContext";
import { courseSearchQuery } from "@/util/api";
import {
  CloseButton,
  Combobox,
  Loader,
  TextInput,
  TextInputProps,
  useCombobox,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { formatCourseCode } from "~/textFormatting";
import { Course } from "~/types";

const MIN_SEARCH_LENGTH = 1;

export interface SearchBarHandle {
  clear: () => void;
  setValue: (value: string) => void;
}

export interface SearchBarProps extends Omit<
  TextInputProps,
  "onSubmit" | "onChange" | "value" | "defaultValue" | "ref"
> {
  onSubmit?: (course: Course) => void;
  onChange?: (value: string) => void;
  ref?: React.Ref<SearchBarHandle>;
}

function SearchBar({ onSubmit, onChange, ref, ...textInputProps }: SearchBarProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const { isAuthenticated } = useAuth();

  const searchQuery = value.trim().replace(/:/g, "");
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 300);

  const { data: courses = [], isFetching } = useQuery({
    ...courseSearchQuery(debouncedSearchQuery),
    enabled: isAuthenticated && debouncedSearchQuery.length >= MIN_SEARCH_LENGTH,
  });

  const searchPending = searchQuery !== debouncedSearchQuery || isFetching;

  useImperativeHandle(ref, () => ({
    clear: () => {
      setValue("");
    },
    setValue: (value: string) => {
      setValue(value);
    },
  }));

  useEffect(() => {
    combobox.updateSelectedOptionIndex();
  }, [courses]);

  const options = courses.map((course) => (
    <Combobox.Option
      value={course.catalogCode}
      key={course.id}
      style={{ color: "var(--cwrublue)" }}
    >
      <div>
        <b>{formatCourseCode(course.catalogCode)}</b>: {course.title}
      </div>
    </Combobox.Option>
  ));

  function processOnChange(newValue: string) {
    setValue(newValue);
    onChange?.(newValue);
    combobox.resetSelectedOption();
    combobox.openDropdown();
  }

  function selectCourse(course: Course) {
    setValue(`${formatCourseCode(course.catalogCode)}: ${course.title}`);
    combobox.closeDropdown();
    onSubmit?.(course);
  }

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(optionValue) => {
        const selectedCourse = courses.find((course) => course.catalogCode === optionValue);

        if (selectedCourse) {
          selectCourse(selectedCourse);
        }
      }}
    >
      <Combobox.Target>
        <TextInput
          flex={1}
          miw={0}
          ref={inputRef}
          value={value}
          {...textInputProps}
          onChange={(event) => {
            processOnChange(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          rightSection={
            searchPending ? (
              <Loader size={18} />
            ) : value ? (
              <CloseButton
                aria-label="Clear search"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  processOnChange("");
                  inputRef.current?.focus();
                }}
              />
            ) : undefined
          }
        />
      </Combobox.Target>

      <Combobox.Dropdown hidden={!value.trim()}>
        <Combobox.Options mah={250} style={{ overflowY: "auto" }}>
          {!isAuthenticated ? (
            <Combobox.Empty>Must be logged in to search for courses.</Combobox.Empty>
          ) : searchQuery.length < MIN_SEARCH_LENGTH ? (
            <Combobox.Empty>
              Enter at least {MIN_SEARCH_LENGTH} characters to search...
            </Combobox.Empty>
          ) : (
            <>
              {options}

              {searchPending && <Combobox.Empty>Searching courses...</Combobox.Empty>}

              {!searchPending && value.trim() && courses.length === 0 && (
                <Combobox.Empty>No courses found</Combobox.Empty>
              )}
            </>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default SearchBar;
