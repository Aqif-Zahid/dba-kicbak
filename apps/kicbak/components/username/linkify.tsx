import Link from "next/link";
import { LinkIt, LinkItUrl } from "react-linkify-it";
import { UserLinkWithTooltip } from "./user-link-with-tooltip";

interface LinkifyProps {
  children: React.ReactNode;
}

export const Linkify = ({ children }: LinkifyProps) => {
  return (
    <LinkifyUsername>
      <LinkifyHashtag>
        <LinkifyUrl>{children}</LinkifyUrl>
      </LinkifyHashtag>
    </LinkifyUsername>
  );
};

const LinkifyUrl = ({ children }: LinkifyProps) => {
  return (
    <LinkItUrl className="text-primary hover:underline">{children}</LinkItUrl>
  );
};

const LinkifyUsername = ({ children }: LinkifyProps) => {
  return (
    <LinkIt
      regex={/(@[a-zA-Z0-9_-]+)/}
      component={(match, key) => (
        <UserLinkWithTooltip username={match.slice(1)} key={key}>
          <span onClick={(e) => e.stopPropagation()} className="cursor-pointer">
            {match}
          </span>
        </UserLinkWithTooltip>
      )}
    >
      {children}
    </LinkIt>
  );
};

const LinkifyHashtag = ({ children }: LinkifyProps) => {
  return (
    <LinkIt
      regex={/(#[a-zA-Z0-9]+)/}
      component={(match, key) => (
        <Link
          key={key}
          href={`/hashtag/${match.slice(1)}`}
          className="text-primary hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
};
