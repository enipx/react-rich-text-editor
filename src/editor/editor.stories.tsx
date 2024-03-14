import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import { RichTextEditor, RichTextEditorProps } from './index';

const meta: Meta<RichTextEditorProps> = {
  title: 'Components/Editor',
  component: RichTextEditor,
};

export default meta;
type Story = StoryObj<RichTextEditorProps>;

export const Default: Story = {
  args: {
    // onChange: (arg) => console.log(arg),
    value: `<p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">eeeeertyyyyyyy</span></p>`,
    cssVariables: {
      '--enipx-editor-font-size': '1rem',
      '--enipx-editor-bg': 'hsl(0,0%,0%)',
      '--enipx-editor-color': 'hsl(210,40%,98%)',
      '--enipx-editor-toolbar-button-color': 'hsl(210,40%,98%)',
      '--enipx-editor-toolbar-button-active-bg': 'rgba(255, 255, 255, 0.10)',
      '--enipx-editor-toolbar-button-hover-bg': 'rgba(255, 255, 255, 0.10)',
      '--enipx-editor-placeholder-color': 'rgba(248, 250, 252, 0.70)',
      '--enipx-editor-border-radius': '0.75rem',
      '--enipx-editor-border-color': 'rgba(226, 232, 240, 0.10)',
      '--enipx-editor-link-popup-bg': 'rgba(255, 255, 255, 0.05)',
      '--enipx-editor-link-popup-color': 'hsl(210,40%,98%)',
      '--enipx-editor-toolbar-divider-color': 'rgba(255, 255, 255, 0.08)',
    },
    removeBlockOption: ['ul', 'ol', 'code'],
  },
};
