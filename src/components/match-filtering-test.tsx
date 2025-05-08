import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

interface MatchFilteringTestProps {
  // Add any props you need here
}

export default function MatchFilteringTest({
  ...props
}: MatchFilteringTestProps = {}) {
  return (
    <div className="p-4 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Match Filtering Test</h1>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold mb-4">Filter Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Rating
              </label>
              <select className="w-full p-2 border rounded">
                <option>Any</option>
                <option>4+</option>
                <option>5+</option>
                <option>6+</option>
                <option>7 only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Connection Type
              </label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  All
                </Button>
                <Button variant="outline" className="flex-1">
                  Mutual
                </Button>
                <Button variant="outline" className="flex-1">
                  Pending
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-gray-200"></div>
              <CardContent>
                <h3 className="font-medium">User {i}</h3>
                <div className="text-sm text-gray-500">Rating: {4 + i}</div>
                <div className="mt-2 flex justify-between">
                  <Button size="sm" variant="outline">
                    View Profile
                  </Button>
                  <Button size="sm">Connect</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
