import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $insertNodes } from 'lexical';
import { useEffect, useState } from 'react';

import { RichTextEditorProps } from '../editor';

export const HTMLPlugin = (props: RichTextEditorProps) => {
  const { onChange, value } = props;

  const [mounted, setMounted] = useState(false);

  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (value && editor && !mounted) {
      setMounted(true);
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(value, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        $insertNodes(nodes);
      });
    }
  }, []);

  const onChangeHandler = (editorState: any) => {
    editorState.read(() => {
      onChange?.($generateHtmlFromNodes(editor));
    });
  };

  return <OnChangePlugin onChange={onChangeHandler} />;
};
