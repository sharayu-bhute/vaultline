import { Repo, ScanStatus } from "@/types";
import ScanStatusBadge from "./ScanStatusBadge";
import ScanButton from "./ScanButton";

interface RepoCardProps {
  repo: Repo;
  status?: ScanStatus;
}

export default function RepoCard({ repo, status }: RepoCardProps) {
  return (
    <div className="border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div>
        <h2 className="text-xl font-semibold mb-2">{repo.name}</h2>
        <p className="text-gray-600 mb-4">{repo.fullName}</p>
        <p className="text-gray-600 mb-4">
          {repo.language ? `Language: ${repo.language}` : "Language: N/A"}
        </p>
        <p className="text-gray-600 mb-4">
          {repo.private ? "Private Repository" : "Public Repository"}
        </p>
      </div>
      {status && <ScanStatusBadge status={status} />}
      <ScanButton repoId={repo.id} fullName={repo.fullName} />
    </div>
  );
}