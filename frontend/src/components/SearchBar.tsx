import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Dispatch, SetStateAction } from "react";

export type SearchBarProps = {
  placeholder: string;
  input: string;
  setInput: Dispatch<SetStateAction<string>>;
};

export const SearchBar = ({ placeholder, input, setInput }: SearchBarProps) => (
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder={placeholder}
      value={input}
      onChange={(e) => setInput(e.target.value)}
      className="pl-9"
    />
  </div>
);
