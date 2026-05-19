"use client";

import {
  useId,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ClipboardEvent,
  type FieldsetHTMLAttributes,
  type FormHTMLAttributes,
  type ChangeEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cx } from "../cx";
import type { ControlSize, FormControlVariant } from "../types";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EyeIcon,
  EyeOffIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
} from "./icons";

function callEventHandler<TEvent>(
  handler: ((event: TEvent) => void) | undefined,
  event: TEvent,
) {
  handler?.(event);
}

function useInteractiveState() {
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  return {
    focused,
    hovered,
    interactiveHandlers: {
      onBlur: () => {
        setFocused(false);
      },
      onFocus: () => {
        setFocused(true);
      },
      onPointerEnter: () => {
        setHovered(true);
      },
      onPointerLeave: () => {
        setHovered(false);
      },
    },
  };
}

type SharedFieldProps = {
  description?: string | undefined;
  error?: string | undefined;
  fieldClassName?: string | undefined;
  fullWidth?: boolean | undefined;
  invalid?: boolean | undefined;
  label?: string | undefined;
  labelMode?: "above" | "floating" | undefined;
  size?: ControlSize | undefined;
  variant?: FormControlVariant | undefined;
};

type FieldProps = {
  as?: "div" | "label" | undefined;
  children: ReactNode;
  className?: string | undefined;
  description?: string | undefined;
  error?: string | undefined;
  filled?: boolean | undefined;
  fullWidth?: boolean | undefined;
  label?: string | undefined;
  labelId?: string | undefined;
  labelMode?: "above" | "floating" | undefined;
  required?: boolean | undefined;
  size?: ControlSize | undefined;
};

export function Field({
  as: Root = "label",
  children,
  className,
  description,
  error,
  filled = false,
  fullWidth = false,
  label,
  labelId,
  labelMode = "above",
  required = false,
  size = "md",
}: FieldProps) {
  return (
    <Root
      className={cx("field__root__SW0bd", className)}
      data-filled={filled ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      data-label-mode={labelMode === "floating" ? "floating" : undefined}
      data-required={required ? "true" : undefined}
      data-size={labelMode === "floating" ? size : undefined}
    >
      {label ? (
        <span
          className="label__root__SW0bl"
          data-required={required ? "true" : undefined}
          id={labelId}
        >
          {label}
        </span>
      ) : null}
      {children}
      {description && !error ? (
        <p className="description__root__SW0bm">{description}</p>
      ) : null}
      <p
        className="error__root__SW0bn"
        data-visible={error ? "true" : undefined}
      >
        {error}
      </p>
    </Root>
  );
}

export function Form({
  children,
  className,
  ...props
}: FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form {...props} className={cx("form__root__SW0bo", className)}>
      {children}
    </form>
  );
}

type FieldsetProps = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  actions?: ReactNode;
  columns?: 1 | 2;
  legend: string;
};

export function Fieldset({
  actions,
  children,
  className,
  columns = 2,
  legend,
  style,
  ...props
}: FieldsetProps) {
  return (
    <fieldset
      {...props}
      className={cx("fieldset__root__SW0bp", className)}
      style={style}
    >
      <legend className="fieldset__legend__SW0bq">{legend}</legend>
      <div
        className="fieldset__group__SW0br"
        style={
          columns === 1
            ? {
                gridTemplateColumns: "1fr",
              }
            : undefined
        }
      >
        {children}
      </div>
      {actions ? <div className="fieldset__actions__SW0bs">{actions}</div> : null}
    </fieldset>
  );
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & SharedFieldProps;

function hasInputValue(value: InputHTMLAttributes<HTMLInputElement>["value"]) {
  if (value === undefined || value === null) {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return String(value).length > 0;
}

export function TextField({
  className,
  defaultValue,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  labelMode = "above",
  placeholder,
  size = "md",
  type,
  value,
  variant = "primary",
  onBlur,
  onChange,
  onFocus,
  onInput,
  onPointerEnter,
  onPointerLeave,
  ...props
}: TextFieldProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const inputRef = useRef<HTMLInputElement>(null);
  const [filled, setFilled] = useState(() => hasInputValue(value ?? defaultValue));

  useEffect(() => {
    if (value !== undefined) {
      setFilled(hasInputValue(value));
    }
  }, [value]);

  useEffect(() => {
    if (value !== undefined) {
      return undefined;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      if (inputRef.current) {
        setFilled(hasInputValue(inputRef.current.value));
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      filled={filled}
      fullWidth={fullWidth}
      label={label}
      labelMode={labelMode}
      required={props.required}
      size={size}
    >
      <input
        {...props}
        aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
        className={cx("input__root__SW0be", className)}
        data-control-focused={focused ? "true" : undefined}
        data-control-hovered={hovered ? "true" : undefined}
        data-filled={filled ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={invalid || error ? "true" : undefined}
        data-label-mode={labelMode === "floating" ? "floating" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
        defaultValue={defaultValue}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          setFilled(hasInputValue(event.currentTarget.value));
          callEventHandler(onBlur, event);
        }}
        onChange={(event) => {
          setFilled(hasInputValue(event.currentTarget.value));
          callEventHandler(onChange, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          setFilled(hasInputValue(event.currentTarget.value));
          callEventHandler(onFocus, event);
        }}
        onInput={(event) => {
          setFilled(hasInputValue(event.currentTarget.value));
          callEventHandler(onInput, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
        placeholder={labelMode === "floating" ? " " : placeholder}
        ref={inputRef}
        type={type}
        value={value}
      />
    </Field>
  );
}

type DateParts = {
  day: number;
  monthIndex: number;
  year: number;
};

type MonthView = Pick<DateParts, "monthIndex" | "year">;

type DatePickerDay = DateParts & {
  dateValue: string;
  outsideMonth: boolean;
};

type DatePickerPosition = {
  left: number | null;
  maxHeight: number | null;
  placement: "bottom" | "top";
};

export type DatePickerCopy = {
  monthLabel?: string;
  nextMonthLabel?: string;
  openLabel?: string;
  previousMonthLabel?: string;
  selectedLabel?: string;
  yearLabel?: string;
};

export type DatePickerClassNames = Partial<
  Record<
    | "base"
    | "calendar"
    | "calendarContent"
    | "cell"
    | "grid"
    | "header"
    | "navButton"
    | "popoverContent"
    | "selectorButton"
    | "selectors"
    | "weekdays",
    string
  >
>;

export type DatePickerProps = SharedFieldProps & {
  className?: string | undefined;
  classNames?: DatePickerClassNames | undefined;
  copy?: DatePickerCopy | undefined;
  defaultValue?: string | undefined;
  defaultViewValue?: string | undefined;
  disabled?: boolean | undefined;
  isDateUnavailable?: ((dateValue: string) => boolean) | undefined;
  locale?: string | undefined;
  maxValue?: string | undefined;
  minValue?: string | undefined;
  name?: string | undefined;
  onValueChange?: (value: string) => void;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  value?: string | undefined;
  yearOrder?: "ascending" | "descending" | undefined;
};

const datePickerViewportMargin = 8;
const defaultDatePickerPosition: DatePickerPosition = {
  left: null,
  maxHeight: null,
  placement: "bottom",
};
const defaultDatePickerCopy = {
  monthLabel: "Month",
  nextMonthLabel: "Next month",
  openLabel: "Choose date",
  previousMonthLabel: "Previous month",
  selectedLabel: "Selected date",
  yearLabel: "Year",
} satisfies Required<DatePickerCopy>;

function getTodayDateValue() {
  const today = new Date();

  return formatDateValue({
    day: today.getDate(),
    monthIndex: today.getMonth(),
    year: today.getFullYear(),
  });
}

function parseDateValue(value: string | undefined): DateParts | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, monthIndex, day));

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(monthIndex) ||
    !Number.isInteger(day) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== monthIndex ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return { day, monthIndex, year };
}

function formatDateValue({ day, monthIndex, year }: DateParts) {
  return [
    year,
    String(monthIndex + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

function compareDateParts(first: DateParts, second: DateParts) {
  const firstTime = Date.UTC(first.year, first.monthIndex, first.day);
  const secondTime = Date.UTC(second.year, second.monthIndex, second.day);

  return firstTime === secondTime ? 0 : firstTime > secondTime ? 1 : -1;
}

function getDaysInMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function getMondayStartOffset(year: number, monthIndex: number) {
  const day = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();

  return (day + 6) % 7;
}

function addMonths({ monthIndex, year }: MonthView, delta: number) {
  const date = new Date(Date.UTC(year, monthIndex + delta, 1));

  return {
    monthIndex: date.getUTCMonth(),
    year: date.getUTCFullYear(),
  };
}

function getDatePickerDays({ monthIndex, year }: MonthView) {
  const daysInMonth = getDaysInMonth(year, monthIndex);
  const startOffset = getMondayStartOffset(year, monthIndex);
  const previousMonth = addMonths({ monthIndex, year }, -1);
  const nextMonth = addMonths({ monthIndex, year }, 1);
  const daysInPreviousMonth = getDaysInMonth(previousMonth.year, previousMonth.monthIndex);
  const leadingDays = Array.from({ length: startOffset }, (_, index): DatePickerDay => {
    const day = daysInPreviousMonth - startOffset + index + 1;

    return {
      day,
      dateValue: formatDateValue({ day, ...previousMonth }),
      outsideMonth: true,
      ...previousMonth,
    };
  });
  const currentDays = Array.from({ length: daysInMonth }, (_, index): DatePickerDay => {
    const day = index + 1;

    return {
      day,
      dateValue: formatDateValue({ day, monthIndex, year }),
      outsideMonth: false,
      monthIndex,
      year,
    };
  });
  const trailingDayCount = 42 - leadingDays.length - currentDays.length;
  const trailingDays = Array.from({ length: trailingDayCount }, (_, index): DatePickerDay => {
    const day = index + 1;

    return {
      day,
      dateValue: formatDateValue({ day, ...nextMonth }),
      outsideMonth: true,
      ...nextMonth,
    };
  });

  return [...leadingDays, ...currentDays, ...trailingDays];
}

function isMonthBefore({ monthIndex, year }: MonthView, boundary: DateParts | null) {
  if (!boundary) {
    return false;
  }

  return year < boundary.year || (year === boundary.year && monthIndex < boundary.monthIndex);
}

function isMonthAfter({ monthIndex, year }: MonthView, boundary: DateParts | null) {
  if (!boundary) {
    return false;
  }

  return year > boundary.year || (year === boundary.year && monthIndex > boundary.monthIndex);
}

function clampMonthView(view: MonthView, minDate: DateParts | null, maxDate: DateParts | null) {
  if (isMonthBefore(view, minDate) && minDate) {
    return {
      monthIndex: minDate.monthIndex,
      year: minDate.year,
    };
  }

  if (isMonthAfter(view, maxDate) && maxDate) {
    return {
      monthIndex: maxDate.monthIndex,
      year: maxDate.year,
    };
  }

  return view;
}

function getYearOptions({
  maxDate,
  minDate,
  order,
}: {
  maxDate: DateParts | null;
  minDate: DateParts | null;
  order: "ascending" | "descending";
}) {
  const minYear = minDate?.year ?? 1900;
  const maxYear = maxDate?.year ?? 2099;
  const startYear = Math.min(minYear, maxYear);
  const endYear = Math.max(minYear, maxYear);
  const years = Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index);

  return order === "descending" ? years.reverse() : years;
}

export function DatePicker({
  className,
  classNames,
  copy,
  defaultValue,
  defaultViewValue,
  description,
  disabled = false,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  isDateUnavailable,
  label,
  labelMode = "floating",
  locale = "en",
  maxValue,
  minValue,
  name,
  onValueChange,
  readOnly = false,
  required = false,
  size = "md",
  value,
  yearOrder = "descending",
}: DatePickerProps) {
  const controlled = value !== undefined;
  const rootRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pointerFocusRef = useRef(false);
  const skipNextFocusOpenRef = useRef(false);
  const labelId = useId();
  const mergedCopy = { ...defaultDatePickerCopy, ...copy };
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = controlled ? (value ?? "") : internalValue;
  const [open, setOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] =
    useState<DatePickerPosition>(defaultDatePickerPosition);
  const selectedParts = parseDateValue(currentValue);
  const minDate = parseDateValue(minValue);
  const maxDate = parseDateValue(maxValue);
  const initialView = selectedParts ??
    parseDateValue(defaultViewValue) ??
    parseDateValue(maxValue) ??
    parseDateValue(getTodayDateValue());
  const [viewDate, setViewDate] = useState<MonthView>(() =>
    clampMonthView(
      {
        monthIndex: initialView?.monthIndex ?? 0,
        year: initialView?.year ?? new Date().getFullYear(),
      },
      minDate,
      maxDate,
    ),
  );
  const { monthIndex: viewMonth, year: viewYear } = viewDate;

  useEffect(() => {
    const nextSelectedParts = parseDateValue(currentValue);

    if (!nextSelectedParts) {
      return;
    }

    const nextMinDate = parseDateValue(minValue);
    const nextMaxDate = parseDateValue(maxValue);
    const nextView = clampMonthView(
      {
        monthIndex: nextSelectedParts.monthIndex,
        year: nextSelectedParts.year,
      },
      nextMinDate,
      nextMaxDate,
    );

    setViewDate((currentView) =>
      currentView.monthIndex === nextView.monthIndex && currentView.year === nextView.year
        ? currentView
        : nextView,
    );
  }, [currentValue, maxValue, minValue]);

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }),
    [locale],
  );
  const displayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      timeZone: "UTC",
      year: "numeric",
    }),
    [locale],
  );
  const weekdayLabels = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) =>
        new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short" }).format(
          new Date(Date.UTC(2024, 0, index + 1)),
        ),
      ),
    [locale],
  );
  const yearOptions = useMemo(
    () => getYearOptions({ maxDate, minDate, order: yearOrder }),
    [maxDate, minDate, yearOrder],
  );
  const displayDate = selectedParts
    ? displayFormatter.format(
        new Date(Date.UTC(selectedParts.year, selectedParts.monthIndex, selectedParts.day)),
      )
    : "";
  const monthOptions = Array.from({ length: 12 }, (_, monthIndex) => ({
    disabled: isMonthBefore({ monthIndex, year: viewYear }, minDate) ||
      isMonthAfter({ monthIndex, year: viewYear }, maxDate),
    label: monthFormatter.format(new Date(Date.UTC(2024, monthIndex, 1))),
    value: monthIndex,
  }));
  const calendarDays = getDatePickerDays(viewDate);
  const previousMonth = addMonths(viewDate, -1);
  const nextMonth = addMonths(viewDate, 1);
  const previousMonthDisabled = isMonthBefore(previousMonth, minDate);
  const nextMonthDisabled = isMonthAfter(nextMonth, maxDate);
  const hasError = invalid || Boolean(error);

  function isDateSelectable(dateValue: string, outsideMonth: boolean) {
    const date = parseDateValue(dateValue);

    if (!date || outsideMonth) {
      return false;
    }

    if (minDate && compareDateParts(date, minDate) < 0) {
      return false;
    }

    if (maxDate && compareDateParts(date, maxDate) > 0) {
      return false;
    }

    return !isDateUnavailable?.(dateValue);
  }

  function updateValue(nextValue: string) {
    if (!controlled) {
      setInternalValue(nextValue);
    }

    onValueChange?.(nextValue);
  }

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setCalendarPosition(defaultDatePickerPosition);
        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);

    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      return undefined;
    }

    let animationFrame = 0;

    function readCalendarPosition() {
      const calendar = calendarRef.current;
      const root = rootRef.current;
      const trigger = triggerRef.current;

      if (!calendar || !root || !trigger) {
        return null;
      }

      const calendarRect = calendar.getBoundingClientRect();
      const rootRect = root.getBoundingClientRect();
      const triggerRect = trigger.getBoundingClientRect();
      const gap = datePickerViewportMargin;
      const desiredViewportLeft =
        triggerRect.left + triggerRect.width / 2 - calendarRect.width / 2;
      const maxViewportLeft = Math.max(
        datePickerViewportMargin,
        window.innerWidth - datePickerViewportMargin - calendarRect.width,
      );
      const viewportLeft = Math.min(
        Math.max(desiredViewportLeft, datePickerViewportMargin),
        maxViewportLeft,
      );
      const spaceBelow = window.innerHeight - datePickerViewportMargin - triggerRect.bottom - gap;
      const spaceAbove = triggerRect.top - datePickerViewportMargin - gap;
      const placement =
        spaceBelow >= calendarRect.height || spaceBelow >= spaceAbove ? "bottom" : "top";
      const availableHeight = placement === "bottom" ? spaceBelow : spaceAbove;

      return {
        left: Math.round((viewportLeft - rootRect.left) * 100) / 100,
        maxHeight: Math.max(12, Math.floor(availableHeight)),
        placement,
      } satisfies DatePickerPosition;
    }

    function updateCalendarPosition() {
      const nextPosition = readCalendarPosition();

      if (!nextPosition) {
        return;
      }

      setCalendarPosition((currentPosition) =>
        currentPosition.left === nextPosition.left &&
        currentPosition.maxHeight === nextPosition.maxHeight &&
        currentPosition.placement === nextPosition.placement
          ? currentPosition
          : nextPosition,
      );
    }

    function scheduleCalendarPositionUpdate() {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(updateCalendarPosition);
    }

    updateCalendarPosition();
    window.addEventListener("resize", scheduleCalendarPositionUpdate);
    window.addEventListener("scroll", scheduleCalendarPositionUpdate, true);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", scheduleCalendarPositionUpdate);
      window.removeEventListener("scroll", scheduleCalendarPositionUpdate, true);
    };
  }, [open, viewMonth, viewYear]);

  function moveMonth(direction: -1 | 1) {
    setViewDate((currentView) => {
      const nextView = addMonths(currentView, direction);

      if (direction < 0 && previousMonthDisabled) {
        return currentView;
      }

      if (direction > 0 && nextMonthDisabled) {
        return currentView;
      }

      return clampMonthView(nextView, minDate, maxDate);
    });
  }

  function selectDate(calendarDay: DatePickerDay) {
    if (disabled || readOnly || !isDateSelectable(calendarDay.dateValue, calendarDay.outsideMonth)) {
      return;
    }

    updateValue(calendarDay.dateValue);
    setCalendarPosition(defaultDatePickerPosition);
    setOpen(false);
    skipNextFocusOpenRef.current = true;
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setCalendarPosition(defaultDatePickerPosition);
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  const calendarStyle =
    calendarPosition.left === null || calendarPosition.maxHeight === null
      ? undefined
      : ({
          "--date-picker-left": `${calendarPosition.left}px`,
          "--date-picker-max-block-size": `${calendarPosition.maxHeight}px`,
          "--date-picker-transform": "none",
        } as CSSProperties);

  return (
    <Field
      as="div"
      className={cx(fieldClassName, classNames?.base)}
      description={description}
      error={error}
      filled={Boolean(currentValue)}
      fullWidth={fullWidth}
      label={label}
      labelId={labelId}
      labelMode={labelMode}
      required={required}
      size={size}
    >
      <div
        className={cx("date-picker__root__SW1u0", className)}
        data-disabled={disabled ? "true" : undefined}
        data-filled={currentValue ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={hasError ? "true" : undefined}
        data-open={open ? "true" : undefined}
        data-readonly={readOnly ? "true" : undefined}
        data-required={required ? "true" : undefined}
        data-size={size}
        data-slot="base"
        onKeyDown={handleKeyDown}
        ref={rootRef}
      >
        {name ? (
          <input
            disabled={disabled}
            name={name}
            readOnly={readOnly}
            required={required}
            type="hidden"
            value={currentValue}
          />
        ) : null}
        <button
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-invalid={hasError ? true : undefined}
          aria-label={
            displayDate
              ? `${label ?? mergedCopy.selectedLabel}: ${displayDate}`
              : (label ?? mergedCopy.openLabel)
          }
          className={cx("date-picker__trigger__SW1u1", classNames?.selectorButton)}
          data-slot="selectorButton"
          disabled={disabled}
          onBlur={() => {
            pointerFocusRef.current = false;
          }}
          onClick={() => {
            pointerFocusRef.current = false;

            if (readOnly) {
              return;
            }

            setCalendarPosition(defaultDatePickerPosition);
            setOpen((currentOpen) => !currentOpen);
          }}
          onFocus={() => {
            if (disabled || readOnly) {
              return;
            }

            if (skipNextFocusOpenRef.current) {
              skipNextFocusOpenRef.current = false;
              return;
            }

            if (pointerFocusRef.current) {
              pointerFocusRef.current = false;
              return;
            }

            setCalendarPosition(defaultDatePickerPosition);
            setOpen(true);
          }}
          onPointerDown={() => {
            pointerFocusRef.current = true;
          }}
          ref={triggerRef}
          type="button"
        >
          <span className="date-picker__value__SW1u2">{displayDate}</span>
        </button>
        {open ? (
          <div
            aria-labelledby={labelId}
            className={cx("date-picker__popover__SW1u3", classNames?.popoverContent)}
            data-placement={calendarPosition.placement === "top" ? "top" : undefined}
            data-positioned={calendarPosition.left !== null ? "true" : undefined}
            data-slot="popoverContent"
            ref={calendarRef}
            role="dialog"
            style={calendarStyle}
          >
            <div
              className={cx("date-picker__calendar__SW1u4", classNames?.calendar)}
              data-slot="calendar"
            >
              <div className={cx("date-picker__header__SW1u5", classNames?.header)}>
                <button
                  aria-label={mergedCopy.previousMonthLabel}
                  className={cx("date-picker__nav__SW1u6", classNames?.navButton)}
                  disabled={previousMonthDisabled}
                  onClick={() => moveMonth(-1)}
                  type="button"
                >
                  <ChevronRightIcon aria-hidden="true" data-direction="previous" size={16} />
                </button>
                <div className={cx("date-picker__selectors__SW1u7", classNames?.selectors)}>
                  <label>
                    <span>{mergedCopy.monthLabel}</span>
                    <select
                      disabled={disabled || readOnly}
                      onChange={(event) => {
                        const nextMonthIndex = Number(event.currentTarget.value);

                        setViewDate((currentView) =>
                          clampMonthView(
                            {
                              ...currentView,
                              monthIndex: nextMonthIndex,
                            },
                            minDate,
                            maxDate,
                          ),
                        );
                      }}
                      value={viewMonth}
                    >
                      {monthOptions.map((month) => (
                        <option disabled={month.disabled} key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>{mergedCopy.yearLabel}</span>
                    <select
                      disabled={disabled || readOnly}
                      onChange={(event) => {
                        const nextYear = Number(event.currentTarget.value);

                        setViewDate((currentView) =>
                          clampMonthView(
                            {
                              monthIndex: currentView.monthIndex,
                              year: nextYear,
                            },
                            minDate,
                            maxDate,
                          ),
                        );
                      }}
                      value={viewYear}
                    >
                      {yearOptions.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  aria-label={mergedCopy.nextMonthLabel}
                  className={cx("date-picker__nav__SW1u6", classNames?.navButton)}
                  disabled={nextMonthDisabled}
                  onClick={() => moveMonth(1)}
                  type="button"
                >
                  <ChevronRightIcon aria-hidden="true" size={16} />
                </button>
              </div>
              <div className={cx("date-picker__weekdays__SW1u8", classNames?.weekdays)}>
                {weekdayLabels.map((weekday) => (
                  <span key={weekday}>{weekday}</span>
                ))}
              </div>
              <div
                className={cx(
                  "date-picker__grid__SW1u9",
                  classNames?.grid,
                  classNames?.calendarContent,
                )}
                data-slot="calendarContent"
              >
                {calendarDays.map((calendarDay) => {
                  const selected = calendarDay.dateValue === currentValue;
                  const dayDisabled = !isDateSelectable(
                    calendarDay.dateValue,
                    calendarDay.outsideMonth,
                  );

                  return (
                    <button
                      aria-pressed={selected}
                      className={cx("date-picker__cell__SW1v1", classNames?.cell)}
                      data-disabled={dayDisabled ? "true" : undefined}
                      data-outside-month={calendarDay.outsideMonth ? "true" : undefined}
                      data-selected={selected ? "true" : undefined}
                      data-slot="cell"
                      data-unavailable={dayDisabled ? "true" : undefined}
                      disabled={dayDisabled}
                      key={`${calendarDay.year}-${calendarDay.monthIndex}-${calendarDay.day}`}
                      onClick={() => selectDate(calendarDay)}
                      type="button"
                    >
                      {calendarDay.day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Field>
  );
}

type ColorFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> &
  SharedFieldProps & {
    textInputName?: string;
  };

export function ColorField({
  className,
  defaultValue,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  name,
  size = "md",
  textInputName,
  value,
  variant = "primary",
  ...props
}: ColorFieldProps) {
  const [internalValue, setInternalValue] = useState(String(defaultValue ?? value ?? "#000000"));
  const controlled = value !== undefined;
  const currentValue = String(controlled ? value : internalValue);

  function update(nextValue: string) {
    if (!controlled) {
      setInternalValue(nextValue);
    }

    props.onChange?.({
      target: {
        value: nextValue,
      },
    } as ChangeEvent<HTMLInputElement>);
  }

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
      required={props.required}
    >
      <span
        className={cx("color-field__root__SW1r0", className)}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={invalid || error ? "true" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
      >
        <input
          {...props}
          aria-label={label ? undefined : props["aria-label"]}
          className="color-field__swatch__SW1r1"
          name={name}
          onChange={(event) => update(event.target.value)}
          type="color"
          value={currentValue}
        />
        <input
          aria-label={label ? `${label} value` : undefined}
          className="color-field__input__SW1r2"
          name={textInputName}
          onChange={(event) => update(event.target.value)}
          value={currentValue}
        />
      </span>
    </Field>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & SharedFieldProps;

export function Textarea({
  className,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  size = "md",
  variant = "primary",
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  ...props
}: TextareaProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
      required={props.required}
    >
      <textarea
        {...props}
        aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
        className={cx("textarea__root__SW0bf", className)}
        data-control-focused={focused ? "true" : undefined}
        data-control-hovered={hovered ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={invalid || error ? "true" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
      />
    </Field>
  );
}

type InputGroupProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> &
  SharedFieldProps & {
    prefix?: ReactNode;
    suffix?: ReactNode;
    suffixAction?: ReactNode;
  };

export function InputGroup({
  className,
  defaultValue,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  labelMode = "above",
  prefix,
  placeholder,
  size = "md",
  suffix,
  suffixAction,
  value,
  variant = "primary",
  onBlur,
  onChange,
  onFocus,
  onInput,
  onPointerEnter,
  onPointerLeave,
  ...props
}: InputGroupProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const inputRef = useRef<HTMLInputElement>(null);
  const [filled, setFilled] = useState(() => hasInputValue(value ?? defaultValue));

  useEffect(() => {
    if (value !== undefined) {
      setFilled(hasInputValue(value));
    }
  }, [value]);

  useEffect(() => {
    if (value !== undefined) {
      return undefined;
    }

    const animationFrame = window.requestAnimationFrame(() => {
      if (inputRef.current) {
        setFilled(hasInputValue(inputRef.current.value));
      }
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [value]);

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      filled={filled}
      fullWidth={fullWidth}
      label={label}
      labelMode={labelMode}
      required={props.required}
      size={size}
    >
      <span
        className={cx("input-group__root__SW0bg", className)}
        data-control-focused={focused ? "true" : undefined}
        data-control-hovered={hovered ? "true" : undefined}
        data-disabled={props.disabled ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
        data-invalid={invalid || error ? "true" : undefined}
        data-label-mode={labelMode === "floating" ? "floating" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
      >
        {prefix ? <span className="input-group__prefix__SW0bz">{prefix}</span> : null}
        <input
          {...props}
          aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
          className="input-group__input__SW0bw"
          data-size={size}
          defaultValue={defaultValue}
          onBlur={(event) => {
            interactiveHandlers.onBlur();
            setFilled(hasInputValue(event.currentTarget.value));
            callEventHandler(onBlur, event);
          }}
          onChange={(event) => {
            setFilled(hasInputValue(event.currentTarget.value));
            callEventHandler(onChange, event);
          }}
          onFocus={(event) => {
            interactiveHandlers.onFocus();
            setFilled(hasInputValue(event.currentTarget.value));
            callEventHandler(onFocus, event);
          }}
          onInput={(event) => {
            setFilled(hasInputValue(event.currentTarget.value));
            callEventHandler(onInput, event);
          }}
          onPointerEnter={(event) => {
            interactiveHandlers.onPointerEnter();
            callEventHandler(onPointerEnter, event);
          }}
          onPointerLeave={(event) => {
            interactiveHandlers.onPointerLeave();
            callEventHandler(onPointerLeave, event);
          }}
          placeholder={labelMode === "floating" ? " " : placeholder}
          ref={inputRef}
          value={value}
        />
        {suffix ? <span className="input-group__suffix__SW0c0">{suffix}</span> : null}
        {suffixAction ? (
          <span className="input-group__action-slot__SW0l5" data-size={size}>
            {suffixAction}
          </span>
        ) : null}
      </span>
    </Field>
  );
}

type PasswordFieldProps = Omit<InputGroupProps, "prefix" | "suffixAction">;

export function PasswordField({
  size = "md",
  suffix,
  ...props
}: PasswordFieldProps) {
  const [revealed, setRevealed] = useState(false);

  return (
    <InputGroup
      {...props}
      size={size}
      suffix={suffix}
      suffixAction={
        <button
          aria-label={revealed ? "Hide password" : "Show password"}
          aria-pressed={revealed}
          className="input-group__action__SW0c1"
          data-size={size}
          onClick={() => {
            setRevealed((current) => !current);
          }}
          type="button"
        >
          {revealed ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
      type={revealed ? "text" : "password"}
    />
  );
}

type SearchFieldProps = Omit<TextFieldProps, "type"> & {
  icon?: ReactNode;
};

export function SearchField({
  className,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  icon = <SearchIcon />,
  invalid = false,
  label,
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  size = "md",
  variant = "primary",
  ...props
}: SearchFieldProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
      required={props.required}
    >
      <span
        aria-invalid={invalid || !!error ? "true" : undefined}
        className="search__root__SW0bi"
        data-full-width={fullWidth ? "true" : undefined}
        data-size={size}
        data-variant={variant}
      >
        <span aria-hidden="true" className="search__icon__SW0c2">
          {icon}
        </span>
        <input
          {...props}
          className={cx(
            "input__root__SW0be",
            "search__input__SW0by",
            className,
          )}
          data-control-focused={focused ? "true" : undefined}
          data-control-hovered={hovered ? "true" : undefined}
          data-full-width={fullWidth ? "true" : undefined}
          data-invalid={invalid || error ? "true" : undefined}
          data-size={size}
          data-variant={variant === "secondary" ? "secondary" : undefined}
          onBlur={(event) => {
            interactiveHandlers.onBlur();
            callEventHandler(onBlur, event);
          }}
          onFocus={(event) => {
            interactiveHandlers.onFocus();
            callEventHandler(onFocus, event);
          }}
          onPointerEnter={(event) => {
            interactiveHandlers.onPointerEnter();
            callEventHandler(onPointerEnter, event);
          }}
          onPointerLeave={(event) => {
            interactiveHandlers.onPointerLeave();
            callEventHandler(onPointerLeave, event);
          }}
          type="search"
        />
      </span>
    </Field>
  );
}

type NumberFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue" | "onChange" | "size" | "type" | "value"> &
  SharedFieldProps & {
    defaultValue?: number;
    onValueChange?: (value: number | null, rawValue: string) => void;
    step?: number;
    value?: number;
  };

export function NumberField({
  className,
  defaultValue,
  description,
  disabled,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  max,
  min,
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  onValueChange,
  size = "md",
  step = 1,
  value,
  variant = "primary",
  ...props
}: NumberFieldProps) {
  const controlled = value !== undefined;
  const [internalValue, setInternalValue] = useState(
    defaultValue === undefined ? "" : String(defaultValue),
  );
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const rawValue = controlled ? String(value ?? "") : internalValue;

  function commit(nextValue: string) {
    if (!controlled) {
      setInternalValue(nextValue);
    }

    const parsed =
      nextValue.trim().length === 0 || Number.isNaN(Number(nextValue))
        ? null
        : Number(nextValue);

    onValueChange?.(parsed, nextValue);
  }

  function adjust(delta: number) {
    const current = rawValue.trim().length === 0 ? 0 : Number(rawValue);
    const next = Number.isNaN(current) ? 0 : current + delta;
    const minValue = min === undefined ? next : Math.max(Number(min), next);
    const bounded = max === undefined ? minValue : Math.min(Number(max), minValue);
    commit(String(bounded));
  }

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
      required={props.required}
    >
      <span
        className="number-field__root__SW0bh"
        data-disabled={disabled ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
      >
        <span
          className={cx("number-field__group__SW0bt", className)}
          data-disabled={disabled ? "true" : undefined}
          data-focus-within={focused ? "true" : undefined}
          data-full-width={fullWidth ? "true" : undefined}
          data-invalid={invalid || error ? "true" : undefined}
          data-control-hovered={hovered ? "true" : undefined}
          data-size={size}
          data-variant={variant === "secondary" ? "secondary" : undefined}
        >
          <button
            className="number-field__control__SW0c3"
            disabled={disabled}
            onClick={() => {
              adjust(-step);
            }}
            type="button"
          >
            <MinusIcon size={16} />
          </button>
          <input
            {...props}
            aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
            className="number-field__input__SW0bx"
            data-size={size}
            disabled={disabled}
            max={max}
            min={min}
            onBlur={(event) => {
              interactiveHandlers.onBlur();
              callEventHandler(onBlur, event);
            }}
            onChange={(event) => {
              commit(event.target.value);
            }}
            onFocus={(event) => {
              interactiveHandlers.onFocus();
              callEventHandler(onFocus, event);
            }}
            onPointerEnter={(event) => {
              interactiveHandlers.onPointerEnter();
              callEventHandler(onPointerEnter, event);
            }}
            onPointerLeave={(event) => {
              interactiveHandlers.onPointerLeave();
              callEventHandler(onPointerLeave, event);
            }}
            step={step}
            type="number"
            value={rawValue}
          />
          <button
            className="number-field__control__SW0c3"
            disabled={disabled}
            onClick={() => {
              adjust(step);
            }}
            type="button"
          >
            <PlusIcon size={16} />
          </button>
        </span>
      </span>
    </Field>
  );
}

type InputOtpProps = SharedFieldProps & {
  autoComplete?: string;
  disabled?: boolean;
  length?: number;
  name?: string;
  onComplete?: (value: string) => void;
  onValueChange?: (value: string) => void;
  required?: boolean;
  separatorEvery?: number;
  value?: string;
};

function cleanOtpValue(value: string, length: number) {
  return value.replace(/\D/g, "").slice(0, length);
}

function getOtpSlots(value: string, length: number) {
  const cleaned = cleanOtpValue(value, length);

  return Array.from({ length }, (_, index) => cleaned[index] ?? "");
}

export function InputOtp({
  autoComplete = "one-time-code",
  description,
  disabled = false,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  length = 6,
  name,
  onComplete,
  onValueChange,
  required = false,
  size = "md",
  separatorEvery = 3,
  value,
  variant = "primary",
}: InputOtpProps) {
  const controlled = value !== undefined;
  const [slotCharacters, setSlotCharacters] = useState(() => getOtpSlots(value ?? "", length));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const lastEmittedValueRef = useRef<string | null>(null);
  const characters = slotCharacters;
  const currentValue = cleanOtpValue(characters.join(""), length);

  function getCompletedValue(nextCharacters: string[]) {
    return nextCharacters.every(Boolean) ? nextCharacters.join("") : "";
  }

  function updateValue(nextCharacters: string[]) {
    const cleaned = cleanOtpValue(nextCharacters.join(""), length);

    setSlotCharacters(nextCharacters);

    lastEmittedValueRef.current = cleaned;
    onValueChange?.(cleaned);

    const completedValue = getCompletedValue(nextCharacters);

    if (completedValue.length === length) {
      onComplete?.(completedValue);
    }
  }

  useEffect(() => {
    if (!controlled) {
      return;
    }

    const cleaned = cleanOtpValue(value ?? "", length);

    if (lastEmittedValueRef.current === cleaned) {
      return;
    }

    setSlotCharacters(getOtpSlots(cleaned, length));
  }, [controlled, length, value]);

  function handleChange(index: number, nextCharacter: string) {
    const cleaned = cleanOtpValue(nextCharacter, length).slice(-1);
    const nextCharacters = [...characters];
    nextCharacters[index] = cleaned;
    updateValue(nextCharacters);

    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowRight" && index < length - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
      return;
    }

    if (event.key === "Backspace" && !characters[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(index: number, event: ClipboardEvent<HTMLInputElement>) {
    const pastedValue = cleanOtpValue(event.clipboardData.getData("text"), length);

    if (!pastedValue) {
      return;
    }

    event.preventDefault();

    const nextCharacters = [...characters];
    pastedValue.split("").forEach((character, offset) => {
      const targetIndex = index + offset;

      if (targetIndex < length) {
        nextCharacters[targetIndex] = character;
      }
    });

    updateValue(nextCharacters);
    inputRefs.current[Math.min(index + pastedValue.length, length - 1)]?.focus();
  }

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
      required={required}
    >
      <div
        className="otp__root__SW0bk"
        data-disabled={disabled ? "true" : undefined}
        data-full-width={fullWidth ? "true" : undefined}
        data-size={size}
        data-variant={variant === "secondary" ? "secondary" : undefined}
      >
        {name ? (
          <input name={name} required={required} type="hidden" value={currentValue} />
        ) : null}
        <div className="otp__container__SW0c4">
          {characters.map((character, index) => {
            const separator =
              separatorEvery > 0 &&
              index > 0 &&
              index < characters.length &&
              index % separatorEvery === 0;

            return (
              <div className="otp__group__SW0c5" key={index}>
                {separator ? (
                  <span
                    aria-hidden="true"
                    className="otp__separator__SW0c6"
                  />
                ) : null}
                <input
                  autoComplete={autoComplete}
                  className="otp__slot__SW0bu"
                  data-active={activeIndex === index ? "true" : undefined}
                  data-control-hovered={hoveredIndex === index ? "true" : undefined}
                  data-disabled={disabled ? "true" : undefined}
                  data-filled={character ? "true" : undefined}
                  data-invalid={invalid || error ? "true" : undefined}
                  data-size={size}
                  disabled={disabled}
                  inputMode="numeric"
                  key={index}
                  maxLength={1}
                  onChange={(event) => {
                    handleChange(index, event.target.value);
                  }}
                  onFocus={() => {
                    setActiveIndex(index);
                    inputRefs.current[index]?.select();
                  }}
                  onBlur={() => {
                    setActiveIndex((current) => (current === index ? null : current));
                  }}
                  onKeyDown={(event) => {
                    handleKeyDown(index, event);
                  }}
                  onPaste={(event) => {
                    handlePaste(index, event);
                  }}
                  onPointerEnter={() => {
                    setHoveredIndex(index);
                  }}
                  onPointerLeave={() => {
                    setHoveredIndex((current) => (current === index ? null : current));
                  }}
                  ref={(node) => {
                    inputRefs.current[index] = node;
                  }}
                  type="text"
                  value={character}
                />
              </div>
            );
          })}
        </div>
      </div>
    </Field>
  );
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & SharedFieldProps;

export function Select({
  children,
  className,
  description,
  error,
  fieldClassName,
  fullWidth = false,
  invalid = false,
  label,
  size = "md",
  variant = "primary",
  onBlur,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  ...props
}: SelectProps) {
  const { focused, hovered, interactiveHandlers } = useInteractiveState();

  return (
    <Field
      className={fieldClassName}
      description={description}
      error={error}
      fullWidth={fullWidth}
      label={label}
      required={props.required}
    >
      <span
        className="select__root__SW0bj"
        data-full-width={fullWidth ? "true" : undefined}
        data-size={size}
      >
        <select
          {...props}
          aria-invalid={invalid || !!error || props["aria-invalid"] ? true : undefined}
          className={cx("select__control__SW0bv", className)}
          data-control-focused={focused ? "true" : undefined}
          data-control-hovered={hovered ? "true" : undefined}
          data-full-width={fullWidth ? "true" : undefined}
          data-invalid={invalid || error ? "true" : undefined}
          data-size={size}
          data-variant={variant === "secondary" ? "secondary" : undefined}
          onBlur={(event) => {
            interactiveHandlers.onBlur();
            callEventHandler(onBlur, event);
          }}
          onFocus={(event) => {
            interactiveHandlers.onFocus();
            callEventHandler(onFocus, event);
          }}
          onPointerEnter={(event) => {
            interactiveHandlers.onPointerEnter();
            callEventHandler(onPointerEnter, event);
          }}
          onPointerLeave={(event) => {
            interactiveHandlers.onPointerLeave();
            callEventHandler(onPointerLeave, event);
          }}
        >
          {children}
        </select>
        <span aria-hidden="true" className="select__icon__SW0c7">
          <ChevronDownIcon size={16} />
        </span>
      </span>
    </Field>
  );
}

type GroupProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  hideLabel?: boolean;
  label?: string;
  orientation?: "horizontal" | "vertical";
};

export function CheckboxGroup({
  children,
  className,
  description,
  disabled = false,
  error,
  hideLabel = false,
  label,
}: GroupProps) {
  return (
    <fieldset
      className={cx("checkbox-group__root__SW0c8", className)}
      data-disabled={disabled ? "true" : undefined}
      data-label-hidden={hideLabel ? "true" : undefined}
      disabled={disabled}
    >
      {label ? <legend className="label__root__SW0bl">{label}</legend> : null}
      {description && !error ? (
        <p className="description__root__SW0bm">{description}</p>
      ) : null}
      {error ? (
        <p className="error__root__SW0bn" data-visible="true">
          {error}
        </p>
      ) : null}
      <div className="checkbox-group__items__SW0ca">{children}</div>
    </fieldset>
  );
}

export function RadioGroup({
  children,
  className,
  description,
  disabled = false,
  error,
  hideLabel = false,
  label,
  orientation = "vertical",
}: GroupProps) {
  return (
    <fieldset
      className={cx("radio-group__root__SW0c9", className)}
      data-disabled={disabled ? "true" : undefined}
      data-label-hidden={hideLabel ? "true" : undefined}
      data-orientation={orientation}
      disabled={disabled}
    >
      {label ? <legend className="label__root__SW0bl">{label}</legend> : null}
      {description && !error ? (
        <p className="description__root__SW0bm">{description}</p>
      ) : null}
      {error ? (
        <p className="error__root__SW0bn" data-visible="true">
          {error}
        </p>
      ) : null}
      <div className="radio-group__items__SW0cb">{children}</div>
    </fieldset>
  );
}

type SelectionControlProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  description?: string;
  fullWidth?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
  label: string;
  variant?: FormControlVariant;
};

export function Checkbox({
  checked,
  className,
  defaultChecked,
  description,
  disabled = false,
  fullWidth = false,
  indeterminate = false,
  invalid = false,
  label,
  onBlur,
  onChange,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  variant = "primary",
  ...props
}: SelectionControlProps) {
  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const selected = controlled ? Boolean(checked) : internalChecked;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <label
      className={cx("checkbox__root__SW0cc", className)}
      data-disabled={disabled ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      data-focused={focused ? "true" : undefined}
      data-hovered={hovered ? "true" : undefined}
      data-indeterminate={indeterminate ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-variant={variant === "secondary" ? "secondary" : undefined}
    >
      <input
        {...props}
        checked={checked}
        className="selection__input__SW0ce"
        defaultChecked={defaultChecked}
        disabled={disabled}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onChange={(event) => {
          if (!controlled) {
            setInternalChecked(event.target.checked);
          }
          callEventHandler(onChange, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
        ref={inputRef}
        type="checkbox"
      />
      <span className="checkbox__control__SW0cg">
        <span className="checkbox__indicator__SW0ci">
          <svg
            aria-hidden="true"
            className={cx("checkbox__icon__SW0ck", "checkbox__check__SW0cm")}
            viewBox="0 0 16 16"
          >
            <path d="M3.6 8.2 6.7 11.3 12.4 4.9" fill="none" />
          </svg>
          <svg
            aria-hidden="true"
            className={cx("checkbox__icon__SW0ck", "checkbox__mixed__SW0cl")}
            viewBox="0 0 16 16"
          >
            <path d="M4 8h8" fill="none" />
          </svg>
        </span>
      </span>
      <span className="selection__content__SW0cn">
        <span className="label__root__SW0bl">{label}</span>
        {description ? <span className="description__root__SW0bm">{description}</span> : null}
      </span>
    </label>
  );
}

type SwitchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> & {
  description?: string;
  invalid?: boolean;
  label: string;
  size?: ControlSize;
  variant?: FormControlVariant;
};

export function Switch({
  checked,
  className,
  defaultChecked,
  description,
  disabled = false,
  invalid = false,
  label,
  onBlur,
  onChange,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  size = "md",
  variant = "primary",
  ...props
}: SwitchProps) {
  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const selected = controlled ? Boolean(checked) : internalChecked;

  return (
    <label
      className={cx("switch__root__SW1r3", className)}
      data-disabled={disabled ? "true" : undefined}
      data-focused={focused ? "true" : undefined}
      data-hovered={hovered ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-size={size}
      data-variant={variant === "secondary" ? "secondary" : undefined}
    >
      <input
        {...props}
        checked={checked}
        className="selection__input__SW0ce"
        defaultChecked={defaultChecked}
        disabled={disabled}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onChange={(event) => {
          if (!controlled) {
            setInternalChecked(event.target.checked);
          }
          callEventHandler(onChange, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
        role="switch"
        type="checkbox"
      />
      <span className="switch__track__SW1r4">
        <span className="switch__thumb__SW1r5" />
      </span>
      <span className="selection__content__SW0cn">
        <span className="label__root__SW0bl">{label}</span>
        {description ? <span className="description__root__SW0bm">{description}</span> : null}
      </span>
    </label>
  );
}

export function Radio({
  checked,
  className,
  defaultChecked,
  description,
  disabled = false,
  fullWidth = false,
  invalid = false,
  label,
  onBlur,
  onChange,
  onFocus,
  onPointerEnter,
  onPointerLeave,
  variant = "primary",
  ...props
}: SelectionControlProps) {
  const controlled = checked !== undefined;
  const [internalChecked, setInternalChecked] = useState(Boolean(defaultChecked));
  const { focused, hovered, interactiveHandlers } = useInteractiveState();
  const selected = controlled ? Boolean(checked) : internalChecked;

  return (
    <label
      className={cx("radio__root__SW0cd", className)}
      data-disabled={disabled ? "true" : undefined}
      data-full-width={fullWidth ? "true" : undefined}
      data-focused={focused ? "true" : undefined}
      data-hovered={hovered ? "true" : undefined}
      data-invalid={invalid ? "true" : undefined}
      data-selected={selected ? "true" : undefined}
      data-variant={variant === "secondary" ? "secondary" : undefined}
    >
      <input
        {...props}
        checked={checked}
        className="selection__input__SW0ce"
        defaultChecked={defaultChecked}
        disabled={disabled}
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onChange={(event) => {
          if (!controlled) {
            setInternalChecked(event.target.checked);
          }
          callEventHandler(onChange, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        onPointerEnter={(event) => {
          interactiveHandlers.onPointerEnter();
          callEventHandler(onPointerEnter, event);
        }}
        onPointerLeave={(event) => {
          interactiveHandlers.onPointerLeave();
          callEventHandler(onPointerLeave, event);
        }}
        type="radio"
      />
      <span className="radio__control__SW0ch">
        <span className="radio__indicator__SW0cj" />
      </span>
      <span className="selection__content__SW0cn">
        <span className="label__root__SW0bl">{label}</span>
        {description ? <span className="description__root__SW0bm">{description}</span> : null}
      </span>
    </label>
  );
}

type ChoiceTileProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  description?: string;
  label: string;
};

export function ChoiceTile({
  checked,
  className,
  description,
  label,
  onBlur,
  onFocus,
  ...props
}: ChoiceTileProps) {
  const { focused, interactiveHandlers } = useInteractiveState();

  return (
    <label
      className={cx("choice-tile__root__SW0co", className)}
      data-focused={focused ? "true" : undefined}
      data-selected={checked ? "true" : undefined}
    >
      <input
        {...props}
        checked={checked}
        className="choice-tile__input__SW0cf"
        onBlur={(event) => {
          interactiveHandlers.onBlur();
          callEventHandler(onBlur, event);
        }}
        onFocus={(event) => {
          interactiveHandlers.onFocus();
          callEventHandler(onFocus, event);
        }}
        readOnly={props.readOnly ?? (checked !== undefined && !props.onChange)}
        type="radio"
      />
      <span className="label__root__SW0bl">{label}</span>
      {description ? <span className="description__root__SW0bm">{description}</span> : null}
    </label>
  );
}
