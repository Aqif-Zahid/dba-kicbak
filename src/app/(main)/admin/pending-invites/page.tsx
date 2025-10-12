"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useGetUsers } from "@/services/users/use-get-users";
import PageError from "@/components/common/error-page";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/loader";
import { inviteColumns } from "@/components/admin/pending-invites/columns";
import { InviteTable } from "@/components/admin/pending-invites/invite-table";

const PendingInvitePage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState("");
  const { data: result, isLoading } = useGetUsers(
    page,
    limit,
    search,
    "",
    "WAITLISTED"
  );

  const handlePageChange = (newPage: number) => setPage(newPage);
  const clearFilter = () => {
    setPage(1);
    setSearch("");
  };

  if (result && result.status !== 1) {
    return <PageError message={result.message || ""} />;
  }

  return (
    <section className="pb-20 w-full">
      <div className="flex flex-col gap-y-4 w-full">
        {/* 🔹 Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-5 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end w-full">
            {/* Search Input */}
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-semibold">Search</label>
              <Input
                className="w-full"
                placeholder="Search by name, email, mobile, reg no."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Clear Filter Button */}
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-semibold invisible">
                Button
              </label>
              <Button className="h-12 w-full" onClick={clearFilter}>
                Clear Filter
              </Button>
            </div>

            {/* Placeholder for 3rd column */}
            <div className="flex flex-col w-full">
              <label className="mb-1 text-sm font-semibold invisible">
                Placeholder
              </label>
              <div />
            </div>
          </div>
        </div>

        {/* 🔹 Pending Requests Table */}
        <div className="bg-white rounded-2xl shadow-lg p-5 w-full">
          {isLoading ? (
            <PageLoader />
          ) : (
            <>
              <h2 className="font-bold mb-4">Pending Requests</h2>
              <InviteTable
                page={page}
                handlePageChange={handlePageChange}
                columns={inviteColumns}
                data={result ? result.data : []}
                totalPages={result ? result.pagination.totalPages : 0}
                total={result ? result.pagination.total : 0}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PendingInvitePage;
