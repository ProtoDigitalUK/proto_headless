import { Component } from "solid-js";
// Hooks
import useRowTarget from "@/hooks/useRowTarget";
// Types
import { TableRowProps } from "@/types/components";
import { EmailResT } from "@lucid/types/src/email";
// Components
import Table from "@/components/Groups/Table";
import TextCol from "@/components/Tables/Columns/TextCol";
import DateCol from "@/components/Tables/Columns/DateCol";
import PillCol from "@/components/Tables/Columns/PillCol";

interface EmailRowProps extends TableRowProps {
  email: EmailResT;
  include: boolean[];
  rowTarget: ReturnType<typeof useRowTarget>;
}

const EmailRow: Component<EmailRowProps> = (props) => {
  // ----------------------------------
  // Render
  return (
    <Table.Tr
      index={props.index}
      selected={props.selected}
      options={props.options}
      callbacks={props.callbacks}
    >
      <PillCol
        text={props.email.delivery_status}
        theme={
          props.email.delivery_status === "sent"
            ? "green"
            : props.email.delivery_status === "failed"
            ? "red"
            : "grey"
        }
        options={{ include: props?.include[0] }}
      />
      <TextCol
        text={props.email.mail_details.subject}
        options={{ include: props?.include[1], maxLines: 2 }}
      />
      <PillCol
        text={props.email.mail_details.template}
        options={{ include: props?.include[2] }}
      />
      <TextCol
        text={props.email.mail_details.to}
        options={{ include: props?.include[3], maxLines: 1 }}
      />
      <TextCol
        text={props.email.mail_details.from.address}
        options={{ include: props?.include[4], maxLines: 1 }}
      />
      <PillCol
        text={props.email.sent_count || 0}
        theme={!props.email.sent_count ? "red" : "grey"}
        options={{ include: props?.include[5] }}
      />
      <PillCol
        text={props.email.type}
        theme={"grey"}
        options={{ include: props?.include[6] }}
      />
      <DateCol
        date={props.email.created_at}
        options={{ include: props?.include[7] }}
      />
      <DateCol
        date={props.email.updated_at}
        options={{ include: props?.include[8] }}
      />
    </Table.Tr>
  );
};

export default EmailRow;