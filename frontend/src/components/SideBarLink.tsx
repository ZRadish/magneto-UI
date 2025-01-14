import { Link } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  name: string;
  isOpen: boolean;
  to: string;
  onClick?: () => void;
}

const SideBarLink = ({ children, name, isOpen, to, onClick }: Props) => {
  return (
    <Link
      to={to}
      className="flex p-1 rounded cursor-pointer stroke-[0.75] hover:stroke-neutral-100 stroke-neutral-400 text-neutral-400 hover:text-neutral-100 place-items-center gap-3 hover:bg-neutral-700/30 transition-colors duration-100"
      onClick={onClick}
    >
      {children}
      {isOpen && (
        <p className="text-inherit font-poppins overflow-clip whitespace-nowrap tracking-wide">
          {name}
        </p>
      )}
    </Link>
  );
};

export default SideBarLink;
