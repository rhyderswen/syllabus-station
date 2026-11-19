import { CloseButton, Combobox, Loader, TextInput, useCombobox } from "@mantine/core";
import { useEffect, useState } from "react";

export interface SearchOption {
  value: string;
  label: string;
  catalogCode?: string;
  courseID?: string;
  title?: string;
}

export interface FormSearchBarProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: SearchOption) => void;
  search: (query: string, signal: AbortSignal) => Promise<SearchOption[]>;
  disabled?: boolean;
  required?: boolean;
  error?: React.ReactNode;
  minSearchLength?: number;
  searchEnabled?: boolean;
  maxLength?: number;
}

function FormSearchBar({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  search,
  disabled = false,
  required = false,
  error,
  minSearchLength = 1,
  searchEnabled = true,
  maxLength,
}: FormSearchBarProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [options, setOptions] = useState<SearchOption[]>([]);
  const [searchPending, setSearchPending] = useState(false);

  const searchQuery = value.trim().replace(/:/g, "");

  useEffect(() => {
    if (!searchEnabled || disabled || searchQuery.length < minSearchLength) {
      setOptions([]);
      setSearchPending(false);
      return;
    }

    const controller = new AbortController();

    setSearchPending(true);

    const timeout = setTimeout(async () => {
      try {
        const results = await search(searchQuery, controller.signal);

        if (!controller.signal.aborted) {
          setOptions(results);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error);
          setOptions([]);
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
  }, [searchQuery, search, disabled, minSearchLength, searchEnabled]);

  useEffect(() => {
    combobox.updateSelectedOptionIndex();
  }, [options]);

  function handleChange(newValue: string) {
    onChange(newValue);
    combobox.resetSelectedOption();
    combobox.openDropdown();
  }

  function selectOption(option: SearchOption) {
    onChange(option.value);
    onSelect?.(option);
    combobox.closeDropdown();
  }

  return (
    <Combobox
      store={combobox}
      withinPortal={false}
      onOptionSubmit={(optionValue) => {
        const selectedOption = options.find((option) => option.value === optionValue);

        if (selectedOption) {
          selectOption(selectedOption);
        }
      }}
    >
      <Combobox.Target>
        <TextInput
          label={label}
          placeholder={placeholder}
          value={value}
          required={required}
          error={error}
          disabled={disabled}
          onChange={(event) => handleChange(event.currentTarget.value)}
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
                  handleChange("");
                }}
              />
            ) : undefined
          }
          maxLength={maxLength}
        />
      </Combobox.Target>

      <Combobox.Dropdown hidden={!value.trim() || disabled || !searchEnabled}>
        <Combobox.Options mah={250} style={{ overflowY: "auto" }}>
          {searchQuery.length < minSearchLength ? (
            <Combobox.Empty>
              Enter at least {minSearchLength} characters to search...
            </Combobox.Empty>
          ) : (
            <>
              {options.map((option) => (
                <Combobox.Option value={option.value} key={option.value}>
                  {option.label}
                </Combobox.Option>
              ))}

              {searchPending && <Combobox.Empty>Searching...</Combobox.Empty>}

              {!searchPending && options.length === 0 && (
                <Combobox.Empty>No results found. You can enter your own value.</Combobox.Empty>
              )}
            </>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
}

export default FormSearchBar;
