/*
 * ProjectSnapshotResponse is the response body for a successful retrieval
 * for a project snapshot.
 */
export interface ProjectSnapshotResponse {
    id: string;
    project_id: string;
    // data is a base64 encoded json payload
    data: string;
    version_number: number;
    title: string;
    description?: string;
    parent_snapshot_id?: string;
    created_at: number;
}
