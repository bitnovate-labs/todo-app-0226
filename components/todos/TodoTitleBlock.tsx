import { formatTodoTime } from "@/lib/todos";

type TodoTitleBlockProps = {
  title: string;
  time: string | null;
  completed: boolean;
  listFontSizeClass: string;
  titleClassName?: string;
};

function titleClasses(
  completed: boolean,
  listFontSizeClass: string,
  titleClassName: string
) {
  return `min-w-0 flex-1 break-words leading-snug ${listFontSizeClass} ${titleClassName} ${
    completed ? "text-row-done-text line-through opacity-90" : "text-fg"
  }`;
}

export function TodoTitleBlock({
  title,
  time,
  completed,
  listFontSizeClass,
  titleClassName = "",
}: TodoTitleBlockProps) {
  if (!time) {
    return (
      <span className={titleClasses(completed, listFontSizeClass, titleClassName)}>
        {title}
      </span>
    );
  }

  return (
    <div className="min-w-0 flex-1 flex flex-col gap-0.5">
      <span
        className={`break-words leading-snug ${listFontSizeClass} ${titleClassName} ${
          completed ? "text-row-done-text line-through opacity-90" : "text-fg"
        }`}
      >
        {title}
      </span>
      <span
        className={`text-xs leading-tight ${
          completed ? "text-row-done-text/80" : "text-fg-muted"
        }`}
      >
        {formatTodoTime(time)}
      </span>
    </div>
  );
}
