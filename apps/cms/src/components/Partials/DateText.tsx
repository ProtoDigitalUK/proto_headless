import { type Component, createMemo } from "solid-js";
import dateHelpers from "@/utils/date-helpers";

interface DateTextProps {
	date?: string | null;
}

const DateText: Component<DateTextProps> = (props) => {
	// ----------------------------------
	// Memos
	const date = createMemo(() => {
		if (!props.date) return null;
		return dateHelpers.formatDate(props.date);
	});
	const fullDate = createMemo(() => {
		if (!props.date) return null;
		return dateHelpers.formatFullDate(props.date);
	});

	// TODO: add support for timezones

	// ----------------------------------
	// Render
	return (
		<span class="whitespace-nowrap" title={fullDate() || ""}>
			{date() || "-"}
		</span>
	);
};

export default DateText;
