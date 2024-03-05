import {
  $createCodeNode,
  $isCodeNode,
  getDefaultCodeLanguage,
  getCodeLanguages,
} from '@lexical/code';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
} from '@lexical/rich-text';
import {
  $isParentElementRTL,
  $wrapNodes,
  $isAtNodeEnd,
} from '@lexical/selection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getNodeByKey,
} from 'lexical';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { RichTextEditorProps } from '..';

import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ChatSquareQuote,
  Check,
  ChevronDown,
  Code,
  Justify,
  Link,
  ListOL,
  ListUL,
  PencilFill,
  TextCenter,
  TextLeft,
  TextParagraph,
  TextRight,
  TypeBold,
  TypeH1,
  TypeH2,
  TypeItalic,
  TypeStrikeThrough,
  TypeUnderline,
} from '@/icons';
import { EditorType } from '@/types';

const LowPriority = 1;

const supportedBlockTypes = new Set([
  'paragraph',
  'quote',
  'code',
  'h1',
  'h2',
  'ul',
  'ol',
]);

export const BlockTypeIcons = ({ type }: { type: string }) => {
  switch (type) {
    case 'paragraph':
      return <TextParagraph />;
    case 'quote':
      return <ChatSquareQuote />;
    case 'code':
      return <Code />;
    case 'h1':
      return <TypeH1 />;
    case 'h2':
      return <TypeH2 />;
    case 'ul':
      return <ListUL />;
    case 'ol':
      return <ListOL />;
    default:
      return null;
  }
};

export const ActiveIcon = ({ active }: { active: boolean }) => {
  if (!active) {
    return null;
  }

  return <Check />;
};

const blockTypeToBlockName = {
  code: 'Code Block',
  h1: 'Large Heading',
  h2: 'Small Heading',
  h3: 'Heading',
  h4: 'Heading',
  h5: 'Heading',
  ol: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
  ul: 'Bulleted List',
};

function Divider() {
  return <div className="divider" />;
}

function positionEditorElement(editor: EditorType, rect: any) {
  if (rect === null) {
    editor.style.opacity = '0';
    editor.style.top = '-1000px';
    editor.style.left = '-1000px';
  } else {
    editor.style.opacity = '1';
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
    editor.style.left = `${
      rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2
    }px`;
  }
}

function FloatingLinkEditor({
  editor,
  ...props
}: RichTextEditorProps & { editor: EditorType }) {
  const editorRef = useRef(null);
  const inputRef = useRef<any>(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState<any>(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl('');
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      !nativeSelection?.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection?.anchorNode)
    ) {
      const domRange = nativeSelection?.getRangeAt(0);
      let rect;
      if (nativeSelection?.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange?.getBoundingClientRect();
      }

      if (!mouseDownRef.current) {
        positionEditorElement(editorElem, rect);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== 'link-input') {
      positionEditorElement(editorElem, null);
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl('');
    }

    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }: { editorState: any }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div ref={editorRef} className="link-editor" style={props.cssVariables}>
      {isEditMode ? (
        <input
          ref={inputRef}
          className="link-input"
          value={linkUrl}
          onChange={(event) => {
            setLinkUrl(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (lastSelection !== null) {
                if (linkUrl !== '') {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                }
                setEditMode(false);
              }
            } else if (event.key === 'Escape') {
              event.preventDefault();
              setEditMode(false);
            }
          }}
        />
      ) : (
        <>
          <div className="link-input">
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {linkUrl}
            </a>
            <div
              className="link-edit"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setEditMode(true);
              }}>
              <PencilFill size={12} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function Select({ onChange, className, options, value }: any) {
  return (
    <select className={className} onChange={onChange} value={value}>
      <option hidden value="" />
      {options.map((option: any) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function getSelectedNode(selection: any) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

function BlockOptionsDropdownList({
  editor,
  blockType,
  toolbarRef,
  setShowBlockOptionsDropDown,
  ...props
}: RichTextEditorProps & any) {
  const dropDownRef = useRef<any>(null);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    const dropDown = dropDownRef.current;

    if (toolbar !== null && dropDown !== null) {
      const { top, left } = toolbar.getBoundingClientRect();
      dropDown.style.top = `${top + 40}px`;
      dropDown.style.left = `${left}px`;
    }
  }, [dropDownRef, toolbarRef]);

  useEffect(() => {
    const dropDown = dropDownRef.current;
    const toolbar = toolbarRef.current;

    if (dropDown !== null && toolbar !== null) {
      const handle = (event: any) => {
        const target = event.target;

        if (!dropDown.contains(target) && !toolbar.contains(target)) {
          setShowBlockOptionsDropDown(false);
        }
      };
      document.addEventListener('click', handle);

      return () => {
        document.removeEventListener('click', handle);
      };
    }
  }, [dropDownRef, setShowBlockOptionsDropDown, toolbarRef]);

  const formatParagraph = () => {
    if (blockType !== 'paragraph') {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createParagraphNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatLargeHeading = () => {
    if (blockType !== 'h1') {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h1'));
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatSmallHeading = () => {
    if (blockType !== 'h2') {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode('h2'));
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatBulletList = () => {
    if (blockType !== 'ul') {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND);
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatNumberedList = () => {
    if (blockType !== 'ol') {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND);
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatQuote = () => {
    if (blockType !== 'quote') {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createQuoteNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatCode = () => {
    if (blockType !== 'code') {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createCodeNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  return (
    <div className="dropdown" ref={dropDownRef} style={props?.cssVariables}>
      <button type="button" className="item" onClick={formatParagraph}>
        <TextParagraph />
        <span className="text">Normal</span>
        <ActiveIcon active={blockType === 'paragraph'} />
      </button>
      <button type="button" className="item" onClick={formatLargeHeading}>
        <TypeH1 />
        <span className="text">Large Heading</span>
        <ActiveIcon active={blockType === 'h1'} />
      </button>
      <button type="button" className="item" onClick={formatSmallHeading}>
        <TypeH2 />
        <span className="text">Small Heading</span>
        <ActiveIcon active={blockType === 'h2'} />
      </button>
      <button type="button" className="item" onClick={formatBulletList}>
        <ListUL />
        <span className="text">Bullet List</span>
        <ActiveIcon active={blockType === 'ul'} />
      </button>
      <button type="button" className="item" onClick={formatNumberedList}>
        <ListOL />
        <span className="text">Numbered List</span>
        <ActiveIcon active={blockType === 'ol'} />
      </button>
      <button type="button" className="item" onClick={formatQuote}>
        <ChatSquareQuote />
        <span className="text">Quote</span>
        <ActiveIcon active={blockType === 'quote'} />
      </button>
      <button type="button" className="item" onClick={formatCode}>
        <Code />
        <span className="text">Code Block</span>
        <ActiveIcon active={blockType === 'code'} />
      </button>
    </div>
  );
}

export default function ToolbarPlugin({
  style,
  className,
  ...props
}: RichTextEditorProps & {
  style?: React.CSSProperties;
  className?: string;
}) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState('paragraph');
  const [selectedElementKey, setSelectedElementKey] = useState<any>(null);
  const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] =
    useState(false);
  const [codeLanguage, setCodeLanguage] = useState('');
  const [, setIsRTL] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? (element as any)?.getTag?.()
            : element.getType();
          setBlockType(type);
          if ($isCodeNode(element)) {
            setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
          }
        }
      }
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const codeLanguges = useMemo(() => getCodeLanguages(), []);
  const onCodeLanguageSelect = useCallback(
    (e: any) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(e.target.value);
          }
        }
      });
    },
    [editor, selectedElementKey]
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://');
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div
      className={`toolbar ${className || ''}`}
      ref={toolbarRef}
      style={style}>
      <button
        type="button"
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo">
        <ArrowCounterClockwise />
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo">
        <ArrowClockwise />
      </button>
      <Divider />
      {supportedBlockTypes.has(blockType) && (
        <>
          <button
            type="button"
            className="toolbar-item block-controls"
            onClick={() =>
              setShowBlockOptionsDropDown(!showBlockOptionsDropDown)
            }
            aria-label="Formatting Options">
            <BlockTypeIcons type={blockType} />
            <span className="text">
              {
                blockTypeToBlockName[
                  blockType as keyof typeof blockTypeToBlockName
                ]
              }
            </span>
            <ChevronDown />
          </button>
          {showBlockOptionsDropDown &&
            createPortal(
              <BlockOptionsDropdownList
                editor={editor}
                blockType={blockType}
                toolbarRef={toolbarRef}
                setShowBlockOptionsDropDown={setShowBlockOptionsDropDown}
                {...props}
              />,
              document.body
            )}
          <Divider />
        </>
      )}
      {blockType === 'code' ? (
        <>
          <Select
            className="toolbar-item code-language"
            onChange={onCodeLanguageSelect}
            options={codeLanguges}
            value={codeLanguage}
          />
          <ChevronDown />
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
            }}
            className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
            aria-label="Format Bold">
            <TypeBold />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
            }}
            className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
            aria-label="Format Italics">
            <TypeItalic />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
            }}
            className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
            aria-label="Format Underline">
            <TypeUnderline />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
            }}
            className={
              'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')
            }
            aria-label="Format Strikethrough">
            <TypeStrikeThrough />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
            }}
            className={'toolbar-item spaced ' + (isCode ? 'active' : '')}
            aria-label="Insert Code">
            <Code />
          </button>
          <button
            type="button"
            onClick={insertLink}
            className={'toolbar-item spaced ' + (isLink ? 'active' : '')}
            aria-label="Insert Link">
            <Link />
          </button>
          {isLink &&
            createPortal(
              <FloatingLinkEditor editor={editor} {...props} />,
              document.body
            )}
          <Divider />
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
            }}
            className="toolbar-item spaced"
            aria-label="Left Align">
            <TextLeft />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
            }}
            className="toolbar-item spaced"
            aria-label="Center Align">
            <TextCenter />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
            }}
            className="toolbar-item spaced"
            aria-label="Right Align">
            <TextRight />
          </button>
          <button
            type="button"
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
            }}
            className="toolbar-item"
            aria-label="Justify Align">
            <Justify />
          </button>{' '}
        </>
      )}
    </div>
  );
}
