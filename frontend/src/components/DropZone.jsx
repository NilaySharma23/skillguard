import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { C } from "../constants/tokens"

export default function DropZone({ label, sublabel, icon, onFile, file, multiple, files, onRemove, maxFiles = 3 }) {
  const onDrop = useCallback(accepted => {
    if (multiple) {
      if (accepted.length) onFile(accepted)
    } else {
      if (accepted[0]) onFile(accepted[0])
    }
  }, [onFile, multiple])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: multiple ? maxFiles : 1,
    multiple: !!multiple,
  })

  const hasFiles = multiple ? (files && files.length > 0) : !!file

  return (
    <div>
      <div
        {...getRootProps()}
        className={`dz${isDragActive ? " dz-active" : hasFiles ? " dz-filled" : ""}`}
        style={{ padding: "44px 28px" }}
      >
        <input {...getInputProps()} />
        {hasFiles ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10,
              background: C.accentDim,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>✓</div>
            {multiple ? (
              <div style={{ fontSize: 14, fontWeight: 600, color: C.accent }}>
                {files.length} resume{files.length !== 1 ? "s" : ""} selected
              </div>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 600, color: C.accent }}>{file.name}</div>
            )}
            <div className="mono" style={{ color: C.inkDim }}>
              {multiple ? "Click to add more (max 3)" : "Click to replace"}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: C.bgCardHover,
              border: `1px solid ${C.borderMid}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22,
            }}>{icon}</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.ink, marginBottom: 5 }}>{label}</div>
              <div style={{ fontSize: 12, color: C.inkDim }}>
                {isDragActive ? "Drop it here" : sublabel || "Drag & drop or click to browse"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File list for multi-mode */}
      {multiple && files && files.length > 0 && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          {files.map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "6px 12px", borderRadius: 6,
              background: C.bgCard, border: `1px solid ${C.border}`,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, flexShrink: 0 }} />
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11, color: C.inkMid, flex: 1,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{f.name}</span>
              {onRemove && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(i) }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11, color: C.inkDim, padding: "2px 6px",
                    borderRadius: 4,
                  }}
                  onMouseEnter={e => e.target.style.color = C.red}
                  onMouseLeave={e => e.target.style.color = C.inkDim}
                >✕</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}