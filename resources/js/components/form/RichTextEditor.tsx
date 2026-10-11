import { CKEditor } from "@ckeditor/ckeditor5-react"
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document"
import { Label } from "@/components/ui/label"

interface RichTextEditorProps {
  value: string
  onChange: (data: string) => void
  label?: string
  error?: string
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  error,
}: RichTextEditorProps) {

  return (
    <div className="grid w-full gap-1">
      {label && <Label className="mb-2">{label}</Label>}

      <div
        className={`
            rounded-md border bg-background text-sm
            ${error ? "border-destructive" : "border-input"}
            focus-within:ring-2
            ${error ? "focus-within:ring-destructive" : "focus-within:ring-ring"}
            focus-within:ring-offset-2
            transition
            overflow-hidden
        `}
      >
        <CKEditor
          editor={DecoupledEditor as any}
          data={value}
          config={{
            toolbar: [
              "bold",
              "italic",
              "|",
              "bulletedList",
              "numberedList",
              "|",
              "undo",
              "redo",
            ],
          }}
          onReady={(editor: any) => {
            const toolbarElement = (editor.ui.view.toolbar as any)?.element
            const editableElement = editor.ui.getEditableElement()

            if (toolbarElement && editableElement) {
                editableElement.parentElement?.insertBefore(
                toolbarElement,
                editableElement
                )
            }
          }}
          onChange={(_, editor) => {
            onChange(editor.getData())
          }}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}