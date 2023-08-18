import T from "@/translations";
import { Component, Index } from "solid-js";
import { FaSolidT, FaSolidCalendar, FaSolidEnvelope } from "solid-icons/fa";
// Services
import api from "@/services/api";
// Hooks
import useSearchParams from "@/hooks/useSearchParams";
// Components
import Table from "@/components/Groups/Table";
import UserRow from "@/components/Tables/Rows/UserRow";

interface UsersTableProps {
  searchParams: ReturnType<typeof useSearchParams>;
}

const UsersTable: Component<UsersTableProps> = (props) => {
  // ----------------------------------
  // Queries
  const users = api.users.useGetMultiple({
    queryParams: {
      queryString: props.searchParams.getQueryString,
    },
    enabled: () => props.searchParams.getSettled(),
  });

  // ----------------------------------
  // Render
  return (
    <Table.Root
      key={"users.list"}
      rows={users.data?.data.length || 0}
      meta={users.data?.meta}
      searchParams={props.searchParams}
      head={[
        {
          label: T("first_name"),
          key: "first_name",
          icon: <FaSolidT />,
        },
        {
          label: T("last_name"),
          key: "last_name",
          icon: <FaSolidT />,
        },
        {
          label: T("email"),
          key: "email",
          icon: <FaSolidEnvelope />,
        },
        {
          label: T("created_at"),
          key: "created_at",
          icon: <FaSolidCalendar />,
          sortable: true,
        },
      ]}
      state={{
        isLoading: users.isLoading,
        isError: users.isError,
        isSuccess: users.isSuccess,
      }}
      options={{
        isSelectable: true,
      }}
      callbacks={{
        deleteRows: () => {
          alert("Delete rows");
        },
      }}
    >
      {({ include, isSelectable, selected, setSelected }) => (
        <Index each={users.data?.data || []}>
          {(user, i) => (
            <UserRow
              index={i}
              user={user()}
              include={include}
              selected={selected[i]}
              options={{
                isSelectable,
              }}
              callbacks={{
                setSelected: setSelected,
              }}
            />
          )}
        </Index>
      )}
    </Table.Root>
  );
};

export default UsersTable;