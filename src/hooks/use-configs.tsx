import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table';

import { useTheme } from './use-theme';
import { RichTextEditorProps } from '..';

export const useConfigs = (options: RichTextEditorProps) => {
  const theme = useTheme(options);

  const config = {
    // Default configuration
    namespace: 'MyEditor',
    theme,
    // Handling of errors during update
    onError(error: any) {
      throw error;
    },
    // Any custom nodes go here
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      AutoLinkNode,
      LinkNode,
    ],

    ...options.config,
  };

  const renderPlaceholder = () => {
    if (!options.placeholder) return null;

    return (
      <div
        className={`editor-placeholder ${options.placeholderClassName || ''}`}
        style={options.placeholderStyle}>
        {options?.placeholder}
      </div>
    );
  };

  return {
    config,
    renderPlaceholder,
    toolbarPosition: options.toolbarPosition || 'bottom',
  };
};
