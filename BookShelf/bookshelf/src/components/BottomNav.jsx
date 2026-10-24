import { BookOpen, History, Book, ArrowUpDown, User } from 'lucide-react'

const TABS = [
  ['pustaka', 'Pustaka', BookOpen],
  ['history', 'History', History],
  ['book', 'Book', Book],
  ['upload', 'Upload', ArrowUpDown],
  ['akun', 'Akun', User],
]

export default function BottomNav({ tab, setTab }) {
  return (
    <nav className="nav">
      {TABS.map(([id, label, Icon]) => (
        <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
          <span className="pillb">
            <Icon size={22} />
          </span>
          {label}
        </button>
      ))}
    </nav>
  )
}
