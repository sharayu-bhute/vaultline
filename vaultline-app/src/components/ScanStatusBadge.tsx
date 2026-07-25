import { ScanStatus } from "@/types";
import { STATUS_CONFIG } from "@/lib/constants";

export default function ScanStatusBadge({status}:{status: ScanStatus}) {
    const {label , color} = STATUS_CONFIG[status];
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}
