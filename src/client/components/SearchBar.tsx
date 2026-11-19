import { CloseButton, Combobox, Loader, TextInput, useCombobox } from "@mantine/core";
import { useImperativeHandle, useRef, useState, useEffect } from "react";
import { Course } from "~/types";
import { formatCourseCode } from "../util/textFormatting";

const MIN_SEARCH_LENGTH = 2;

export interface SearchBarHandle {
  clear: () => void;
  setValue: (value: string) => void;
}

export interface SearchBarProps {
  onSubmit?: (course: Course) => void;
  onChange?: (value: string) => void;
  placeholder?: string;
  ref?: React.Ref<SearchBarHandle>;
}

function SearchBar({ onSubmit, onChange, placeholder, ref }: SearchBarProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchPending, setSearchPending] = useState(false);

  const searchQuery = value.trim().replace(/:/g, "");

  useImperativeHandle(ref, () => ({
    clear: () => {
      setValue("");
      setCourses([]);
    },
    setValue: (value: string) => {
      setValue(value);
    },
  }));

  useEffect(() => {
    if (searchQuery.length < MIN_SEARCH_LENGTH) {
      setCourses([]);
      setSearchPending(false);
      return;
    }

    const controller = new AbortController();

    setSearchPending(true);

    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/course/search?query=${encodeURIComponent(searchQuery)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data: { courses: Course[] } = await response.json();

        setCourses(data.courses);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error);
          setCourses([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setSearchPending(false);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [searchQuery]);

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
          placeholder={placeholder}
          onChange={(event) => {
            processOnChange(event.currentTarget.value);
          }}
          onClick={() => combobox.openDropdown()}
          onFocus={() => combobox.openDropdown()}
          onBlur={() => combobox.closeDropdown()}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();

              const selectedIndex = combobox.getSelectedOptionIndex();

              if (selectedIndex !== -1) {
                combobox.selectActiveOption();
              } else if (courses.length > 0) {
                selectCourse(courses[0]);
              }
            }
          }}
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
          {searchQuery.length < MIN_SEARCH_LENGTH ? (
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
