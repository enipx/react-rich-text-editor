import { TRANSFORMERS } from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import CodeHighlightPlugin from './code-highlight';
import { HTMLPlugin } from './html';
import ListMaxIndentLevelPlugin from './list-max-index-level';
import ToolbarPlugin from './toolbar';
import { RichTextEditorProps } from '../editor';

import { useConfigs } from '@/hooks/use-configs';

export const EditorPlugins = (props: RichTextEditorProps) => {
  const { renderPlaceholder, toolbarPosition } = useConfigs(props);

  return (
    <div
      className={`editor-container ${props.containerClassName || ''}`}
      style={{
        ...(props.containerStyle || {}),
        ...(props.cssVariables || {}),
      }}>
      {toolbarPosition === 'top' && (
        <ToolbarPlugin
          className={props?.toolbarClassName}
          style={props?.toolbarStyle}
          {...props}
        />
      )}
      <div className="editor-inner">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className={`editor-input ${props.inputClassName || ''}`}
              style={props.inputStyle}
            />
          }
          placeholder={renderPlaceholder()}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <AutoFocusPlugin />
        <CodeHighlightPlugin />
        <ListPlugin />
        <LinkPlugin />
        <AutoLinkPlugin matchers={[]} />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <HTMLPlugin {...props} />
      </div>
      {toolbarPosition === 'bottom' && (
        <ToolbarPlugin
          className={props?.toolbarClassName}
          style={props?.toolbarStyle}
          {...props}
        />
      )}
    </div>
  );
};
