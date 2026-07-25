import {Severity} from "@/types";
import {SEVERITY_CONFIG} from "@/lib/constants";

export default function SeverityTag({severity}:{severity: Severity}) {
    const {label , color} = SEVERITY_CONFIG[severity];
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
            {label}
        </span>
    );
}

