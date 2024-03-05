# React Rich Text Editor

Rich text input with customization support using lexical ⚡

<br />
<img src="https://res.cloudinary.com/dmsic9qmj/image/upload/v1709661385/ui/rich-text-editor_ui31xj.png">
<br />

## Installation

Install dependencies:

```sh
$ yarn add @enipx/react-rich-text-editor @lexical/react lexical

# or

$ npm i @enipx/react-rich-text-editor @lexical/react lexical
```

## Usage

```jsx
import { RichTextEditor } from "@enipx/react-rich-text-editor"

export default function App() {
  return (
    <RichTextEditor
      value={`<p>Hi</p>`}
      onChange={(value) => {
        console.log(value);
      }}
      containerStyle={{
        border: `1px solid rgba(0,0,0,0.2)`,
        minHeight: '70px',
        borderRadius: '10px',
        padding: '0 1rem',
        fontSize: '0.85rem',
        paddingTop: '1rem',
      }}
      {...rest}
    />
  )
}
```

## Props

| Property | Type | Description |
| -------- | ---- | ----------- |
| value | `string` | Controlled value |
| onChange | `(arg: string) => void` | Return value when input changes |
| containerStyle | `React.CSSProperties` | Add custom styling to the editor container |
| toolbarStyle | `React.CSSProperties` | Add custom styling to the toolbar |
| inputStyle | `React.CSSProperties` | Add custom styling to the input field |
| placeholderStyle | `string` | Add custom styling to the placeholder |

## CSS Variable Styling

## License

MIT ©
