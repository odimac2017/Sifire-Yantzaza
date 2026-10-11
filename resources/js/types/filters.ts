export type FilterConfig<T> =
  | {
      type: "search";
      key: keyof T;
      placeholder?: string;
    }
  | {
      type: "select";
      key: keyof T;
      placeholder?: string;
      options: { value: string | number; label: string }[];
    }
  | {
      type: "date";
      key: keyof T;
      placeholder?: string;
    }
  | {
      type: "year";
      key: keyof T;
      fromYear: number;
      toYear: number;
    }
  | {
      type: "switch";
      key: keyof T;
      label: string;
    }
  | {
      type: "dateRange";
      key: keyof T;
      placeholder?: string;
      presets?: boolean;
  }
