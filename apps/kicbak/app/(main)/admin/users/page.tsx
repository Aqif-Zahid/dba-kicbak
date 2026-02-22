"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useGetProfilesAdmin } from "@/services/profiles/use-get-profiles-admin";
import PageError from "@/components/common/error-page";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UsersTable } from "@/components/admin/users/users-table";
import { profileColumns } from "@/components/admin/profile/profile-columns"; // changed here
import { userRoles } from "@/lib/types";
import { ProfileAdmin } from "@/types/types"; // import type

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // filters
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  //  use the new admin profiles hook
  const { data: result, isLoading } = useGetProfilesAdmin(
    page,
    limit,
    search,
    role,
    "ACTIVE"
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const clearFilter = () => {
    setPage(1);
    setSearch("");
    setRole("");
  };

  if (result && result.status !== 1) {
    return <PageError message={result.message || ""} />;
  }

  return (
    <section className="pb-20">
      <div className="flex flex-col gap-y-4">
        {/* 🔹 Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <p className="mb-1 text-sm font-semibold">Search</p>
              <Input
                placeholder="Search by username or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-col">
              <p className="mb-1 text-sm font-semibold">Role</p>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.map((item) => (
                    <SelectItem value={item} key={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

        {/* 🔹 Table */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          {isLoading ? (
            <PageLoader />
          ) : (
            <div>
              <h2 className="font-bold mb-4">Profiles</h2>
              <UsersTable<ProfileAdmin, any> //  specify the type explicitly
                page={page}
                handlePageChange={handlePageChange}
                columns={profileColumns} //  changed here
                data={result ? result.data : []}
                totalPages={result ? result.pagination.totalPages : 0}
                total={result ? result.pagination.total : 0}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UsersPage;
