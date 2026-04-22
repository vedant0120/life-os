import { useEffect, useRef, type ReactNode, type MouseEvent } from 'react'

interface SheetProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

export default function Sheet({ open, onClose, title, children }: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const openerRef = useRef<Element | null>(null)

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    if (open && !dlg.open) {
      openerRef.current = document.activeElement
      dlg.showModal()
    } else if (!open && dlg.open) {
      dlg.close()
    }
  }, [open])

  useEffect(() => {
    const dlg = ref.current
    if (!dlg) return
    const handleClose = () => {
      onClose()
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus()
    }
    dlg.addEventListener('close', handleClose)
    return () => dlg.removeEventListener('close', handleClose)
  }, [onClose])

  const onBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === ref.current) onClose()
  }

  return (
    <dialog
      ref={ref}
      onClick={onBackdropClick}
      className="
        bg-surface text-text border border-border
        p-0 w-full max-w-full
        fixed left-0 right-0 bottom-0 top-auto mx-0 mt-auto mb-0
        rounded-t-2xl rounded-b-none
        translate-y-4 opacity-0 open:translate-y-0 open:opacity-100
        transition-[transform,opacity] duration-200 ease-out
        backdrop:bg-black/60 backdrop:backdrop-blur-sm
        md:left-1/2 md:right-auto md:bottom-auto md:top-1/2
        md:-translate-x-1/2 md:-translate-y-1/2
        md:open:-translate-x-1/2 md:open:-translate-y-1/2
        md:max-w-lg md:w-[92vw] md:rounded-2xl
      "
    >
      <div className="md:hidden flex justify-center pt-2 pb-1">
        <span className="block h-1 w-10 rounded-full bg-border" aria-hidden />
      </div>
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="text-sm font-semibold text-text">{title}</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="text-muted hover:text-text text-lg leading-none px-1"
        >
          ×
        </button>
      </div>
      <div className="p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">{children}</div>
    </dialog>
  )
}
