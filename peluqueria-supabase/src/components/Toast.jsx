import { useEffect } from 'react'

export default function Toast({ mensaje, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])
  return <div className="toast">{mensaje}</div>
}
