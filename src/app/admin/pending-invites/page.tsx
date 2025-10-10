"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useGetUsers } from "@/services/users/use-get-users";
import PageError from "@/components/common/error-page";
import { Sidebar } from "@/components/admin/sidebar";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/loader";
import { inviteColumns } from "@/components/admin/pending-invites/columns";
import { InviteTable } from "@/components/admin/pending-invites/invite-table";

const PendingInvitePage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // filters
  const [search, setSearch] = useState("");
  const { data: result, isLoading } = useGetUsers(
    page,
    limit,
    search,
    "",
    "WAITLISTED"
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const clearFilter = () => {
    setPage(1);
    setSearch("");
  };

  if (result && result.status !== 1) {
    return <PageError message={result.message || ""} />;
  }

  return (
    <section className="pb-20">
      <div className="container mx-auto px-4">
        <div className="flex min-h-screen flex-col">
          <div className="max-w-7xl mx-auto p-5 flex w-full grow gap-5">
            <Sidebar className="sticky top-[5.50rem] h-fit hidden sm:block flex-none space-y-3 rounded-2xl bg-card px-3 py-5 lg:px-5 shadow-sm xl:w-80" />
            <div className="flex flex-col gap-y-4">
              {/* 🔹 Filters */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <div className=" grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col">
                    <p className="mb-1 text-sm font-semibold">Search</p>
                    <Input
                      placeholder="Search by name, email, mobile, reg no."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  <div className="mb-4">
                    <div className="flex flex-col">
                      <Button className="h-12 md:mt-6" onClick={clearFilter}>
                        Clear Filter
                      </Button>
                    </div>
                    <div />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-5">
                {isLoading ? (
                  <PageLoader />
                ) : (
                  <div>
                    <h2 className="font-bold mb-4"> Pending Requests</h2>
                    <InviteTable
                      page={page}
                      handlePageChange={handlePageChange}
                      columns={inviteColumns}
                      data={result ? result.data : []}
                      totalPages={result ? result.pagination.totalPages : 0}
                      total={result ? result.pagination.total : 0}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <Sidebar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
        </div>
      </div>
    </section>
  );
};

export default PendingInvitePage;
