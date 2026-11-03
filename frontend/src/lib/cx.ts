export const cx = (...clases: (string | false | undefined | null)[]) => clases.filter(Boolean).join(' ');
