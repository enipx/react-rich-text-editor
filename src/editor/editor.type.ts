export interface RichTextEditorProps {
  onChange?: (arg: string) => void;
  value?: string;
  placeholder?: string;
  theme?: Record<string, any>;
  config?: Record<string, any>;
  toolbarPosition?: 'top' | 'bottom';

  // classes
  containerClassName?: string;
  toolbarClassName?: string;
  inputClassName?: string;
  placeholderClassName?: string;

  // styles
  containerStyle?: React.CSSProperties;
  toolbarStyle?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  placeholderStyle?: React.CSSProperties;
  cssVariables?: Record<string, any>;
}