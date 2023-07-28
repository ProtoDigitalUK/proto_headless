import { Component, JSX } from "solid-js";

interface NavigationLinkGroupProps {
  title: string;
  children: JSX.Element;
}

const NavigationLinkGroup: Component<NavigationLinkGroupProps> = (props) => {
  return (
    <div class="px-[15px] mb-[15px] last:mb-0">
      <span class="mb-2.5 block text-sm text-unfocused font-light">
        {props.title}
      </span>
      <ul>{props.children}</ul>
    </div>
  );
};

export default NavigationLinkGroup;