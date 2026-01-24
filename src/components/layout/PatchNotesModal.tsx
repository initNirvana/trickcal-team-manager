import patchNotesData from '../../data/patchNotes.json';
import versionData from '@/data/version.json';

interface PatchSection {
  type: 'added' | 'improved' | 'fixed' | 'removed';
  title: string;
  items: string[];
}

interface PatchNote {
  version: string;
  date: string;
  sections: PatchSection[];
}

interface PatchNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SectionContentProps {
  section: PatchSection;
}

const getSectionColor = (type: string): string => {
  switch (type) {
    case 'added':
      return 'text-success';
    case 'improved':
      return 'text-warning';
    case 'fixed':
      return 'text-info';
    case 'removed':
      return 'text-error';
    default:
      return 'text-base-content';
  }
};

const SectionContent = ({ section }: SectionContentProps) => (
  <div className="space-y-2 text-sm">
    <p className={`font-semibold ${getSectionColor(section.type)}`}>{section.title}</p>
    <ul className="ml-2 list-inside list-disc space-y-1">
      {section.items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
);

const PatchNotesModal = ({ isOpen, onClose }: PatchNotesModalProps) => {
  if (!isOpen) return null;

  const patchNotes: PatchNote[] = patchNotesData as PatchNote[];

  return (
    <dialog open className="modal">
      <div className="modal-box max-h-[80vh] max-w-2xl overflow-y-auto">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2"
          onClick={onClose}
        >
          ✕
        </button>

        <h3 className="mb-4 text-lg font-bold">📝 패치 노트</h3>

        <div className="space-y-4">
          {patchNotes.map((patch) => (
            <div key={patch.version}>
              <div className="divider divider-primary">
                v{patch.version} - {patch.date}
              </div>
              <div className="space-y-3">
                {patch.sections.map((section, idx) => (
                  <SectionContent key={idx} section={section} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-500">Version {versionData.projectVersion}</p>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default PatchNotesModal;
