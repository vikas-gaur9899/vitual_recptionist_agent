import { useEffect, useState } from "react";

import {
  getCampaignsApi,
  createCampaignApi
} from "../api/campaign.api";

import toast from "react-hot-toast";

export default function Campaigns() {

  const [campaigns, setCampaigns] =
    useState([]);

  const [name, setName] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const fetchCampaigns =
    async () => {

      try {

        const res =
          await getCampaignsApi();

        setCampaigns(
          res.data || []
        );

      } catch {

        toast.error(
          "Failed to load campaigns"
        );
      }

      setLoading(false);
    };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const createCampaign =
    async () => {

      if (!name.trim()) {

        return toast.error(
          "Campaign name required"
        );
      }

      try {

        await createCampaignApi({
          name
        });

        toast.success(
          "Campaign created"
        );

        setName("");

        fetchCampaigns();

      } catch {

        toast.error(
          "Failed to create campaign"
        );
      }
    };

  return (

    <div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20
        }}
      >

        <h2>
          Campaigns
        </h2>

      </div>

      <div
        className="card"
        style={{
          marginBottom: 20
        }}
      >

        <h3>
          Create Campaign
        </h3>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 12
          }}
        >

          <input
            className="input"
            placeholder="Campaign Name"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
          />

          <button
            className="btn btn-primary"
            onClick={createCampaign}
          >
            Create
          </button>

        </div>

      </div>

      <div className="table-wrap">

        {loading ? (

          <div className="spinner-wrap">
            <div className="spinner" />
          </div>

        ) : (

          <table>

            <thead>

              <tr>

                <th>Name</th>

                <th>Created By</th>

                <th>Date</th>

              </tr>

            </thead>

            <tbody>

              {campaigns.length === 0 && (

                <tr>

                  <td
                    colSpan={3}
                    className="empty"
                  >
                    No campaigns found
                  </td>

                </tr>

              )}

              {campaigns.map(
                campaign => (

                  <tr
                    key={
                      campaign._id
                    }
                  >

                    <td>
                      {campaign.name}
                    </td>

                    <td>
                      {
                        campaign.uploadedBy
                      }
                    </td>

                    <td>

                      {
                        new Date(
                          campaign.createdAt
                        )
                        .toLocaleDateString(
                          "en-IN"
                        )
                      }

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}