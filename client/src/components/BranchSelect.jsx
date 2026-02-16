import { BRANCHES } from "../constants/branches";

export default function BranchSelect({ value, onChange, className = "" }) {
    return (
        <select
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            className={`w-full bg-slate-950/50 border border-white/5 rounded-2xl py-4 px-6 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-bold appearance-none ${className}`}
        >
            <option value="" disabled className="bg-slate-900 text-slate-500">Select Academic Branch</option>
            {(BRANCHES || []).map(branch => (
                <option key={branch} value={branch} className="bg-slate-900 text-white">
                    {branch}
                </option>
            ))}
        </select>
    );
}
