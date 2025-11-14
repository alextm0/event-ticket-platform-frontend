import { StackHandler } from "@stackframe/stack";
import { stackServerApp } from "../../../stack/server";

type StackHandlerProps = Parameters<typeof StackHandler>[0];

export default function Handler(props: StackHandlerProps) {
  return <StackHandler fullPage app={stackServerApp} routeProps={props} />;
}
