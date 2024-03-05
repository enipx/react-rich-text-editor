'use-client';

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { forwardRef } from 'react';
import './editor.style.css';

import { RichTextEditorProps } from './editor.type';

import { useConfigs } from '@/hooks/use-configs';
import { EditorPlugins } from '@/plugins';

export const RichTextEditor = forwardRef((props: RichTextEditorProps, ref) => {
  const { config } = useConfigs(props);

  return (
    <LexicalComposer initialConfig={config}>
      <EditorPlugins {...props} />
    </LexicalComposer>
  );
});
