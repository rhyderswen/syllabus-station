import {
  CloseButton,
  Combobox,
  Loader,
  TextInput,
  TextInputProps,
  useCombobox,
} from "@mantine/core";
import { useEffect, useRef } from "react";

export interface SearchOption {
  value: string;
  label: string;
  catalogCode?: string;
  courseID?: string;
  title?: string;
}

export interface FormSearchBarProps extends Omit<TextInputProps, "onChange" | "onSelect" | "ref"> {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (option: SearchOption) => void;
  options: SearchOption[];
  isLoading: boolean;
  minSearchLength?: number;
  searchEnabled?: boolean;
  dontOpenOnFirstFocus?: boolean;
}

function FormSearchBar({
  value,
  onChange,
  onSelect,
  options,
  isLoading,
  minSearchLength = 1,
  searchEnabled = true,
  dontOpenOnFirstFocus = false,
  ...textInputProps
}: FormSearchBarProps) {
  const shouldSkipFocus = useRef(dontOpenOnFirstFocus);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFocus() {
    if (shouldSkipFocus.current) {
      shouldSkipFocus.current = false;
      return;
    }

    combobox.openDropdown();
  }

  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });

  const searchQuery = value.trim().replace(/:/g, "");

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
          ref={inputRef}
          value={value}
          onChange={(event) => handleChange(event.currentTarget.value)}
          onClick={() => combobox.openDropdown()}
          onFocus={handleFocus}
          onBlur={() => combobox.closeDropdown()}
          rightSection={
            isLoading ? (
              <Loader size={18} />
            ) : value ? (
              <CloseButton
                aria-label="Clear search"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  handleChange("");
                  inputRef.current?.focus();
                }}
              />
            ) : undefined
          }
          {...textInputProps}
        />
      </Combobox.Target>

      <Combobox.Dropdown
        hidden={(minSearchLength > 0 && !value.trim()) || textInputProps.disabled || !searchEnabled}
      >
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

              {isLoading && <Combobox.Empty>Searching...</Combobox.Empty>}

              {!isLoading && options.length === 0 && (
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
