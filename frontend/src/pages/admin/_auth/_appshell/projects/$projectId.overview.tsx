import { createFileRoute, Link } from '@tanstack/react-router'
import { Stack } from '@layouts'
import { FiFileText, FiMessageSquare, FiDollarSign, FiTrendingUp, FiGlobe, FiLinkedin } from 'react-icons/fi'
import { useEffect, useState } from 'react'
import { CompanyResponse, getCompanyByProjectId } from '@/services/company'
import { TeamMember } from '@/types'
import { getTeamMembers } from '@/services/teams'
import { useAuth } from '@/contexts/AuthContext'
import { getProject, getProjectComments, getProjectDocuments } from '@/services/projects'
import { useWallet } from '@suiet/wallet-kit'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient } from '@mysten/sui/client'
import { Dialog } from '@headlessui/react'

// interface ProjectParams {
//   projectId: string
// }

interface ProjectStats {
  status: string;
  submittedDate?: string;
  documentsCount: number;
}

interface ProjectHistory {
  date: string;
  title: string;
  icon: React.ReactNode;
}

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (amount: string) => Promise<void>;
  isLoading: boolean;
}

function FundingModal({ isOpen, onClose, onSubmit, isLoading }: FundingModalProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  
  // SPURCOIN conversion rate (we need to fetch this once the coin, uhh, exists.)
  const SPURCOIN_TO_CAD = 1.5; 
  const estimatedSPUR = amount ? (parseFloat(amount) / SPURCOIN_TO_CAD).toFixed(2) : '0';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) {
      setError('Please enter a valid amount');
      return;
    }
    try {
      // Convert to smallest SPURCOIN unit
      const spurAmount = parseFloat(estimatedSPUR);
      // 9 decimals for SPURCOIN
      const smallestUnit = Math.floor(spurAmount * 1_000_000_000).toString();
      await onSubmit(smallestUnit);
      onClose();
    } catch (error) {
      setError('Failed to process transaction');
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm rounded-lg bg-white p-6">
          <Dialog.Title className="text-lg font-medium mb-4">Fund Project</Dialog.Title>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (CAD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError('');
                  }}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter amount in CAD"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Estimated SPURCOIN: {estimatedSPUR} SPUR

                </p>
                <p className="mt-1 text-xs text-gray-400">
                  1 SPUR ≈ ${SPURCOIN_TO_CAD} CAD
                </p>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
                >
                  {isLoading ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

export const Route = createFileRoute('/admin/_auth/_appshell/projects/$projectId/overview')({
  component: RouteComponent,
})

function RouteComponent() {
  const { projectId } = Route.useParams()
  const { accessToken } = useAuth()
  const wallet = useWallet()
  const [company, setCompany] = useState<CompanyResponse | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null)
  const [projectHistory, setProjectHistory] = useState<ProjectHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [isSendingFunds, setIsSendingFunds] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFundProject = async (amount: string) => {
    if (!wallet.connected) {
      alert('Please connect your wallet first')
      return
    }

    try {
      setIsSendingFunds(true)

      const client = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
      const coins = await client.getCoins({
        owner: wallet.account?.address || '',
        coinType: '0x341290ce77d8cdd37c0ea13807e1cd6f4070a42c286adfc5340f438b7e8a1684::spurcoin::SPURCOIN'
      });

      if (!coins.data || coins.data.length === 0) {
        alert('No SPUR coins found in wallet');
        return;
      }

      const coinToUse = coins.data[0];
      const tx = new Transaction();
      tx.setGasBudget(100000000);

      // amount is now in MIST (smallest unit)
      const splitCoinTx = tx.splitCoins(
        tx.object(coinToUse.coinObjectId),
        [tx.pure.u64(amount)]
      );

      tx.transferObjects(
        [splitCoinTx],
        tx.pure.address(company?.wallet_address || '')
      );

      if (wallet.account?.address) {
        tx.setSender(wallet.account.address);
      }

      const resData = await wallet.signAndExecuteTransaction({
        transaction: tx
      });

      console.log('Transaction successful:', resData)
      alert('Funding successful!')

    } catch (error) {
      console.error('Transaction failed:', error)
      alert('Failed to send funds. Please try again.')
    } finally {
      setIsSendingFunds(false)
    }
  }

  useEffect(() => {
    async function fetchData() {
      if (!accessToken || !projectId) return

      try {
        // First fetch project and company data since we need the company ID
        const [projectData, companyData] = await Promise.all([
          getProject(accessToken, projectId),
          getCompanyByProjectId(accessToken, projectId)
        ])

        if (!companyData) {
          throw new Error('Company not found')
        }

        // Then fetch remaining data in parallel using the company ID
        const [teamData, documentsData, commentsData] = await Promise.all([
          getTeamMembers(accessToken, companyData.id),
          getProjectDocuments(accessToken, projectId),
          getProjectComments(accessToken, projectId)
        ])

        setCompany(companyData)
        setTeamMembers(teamData)

        // Set project stats
        setProjectStats({
          status: projectData.status,
          submittedDate: projectData.status === 'submitted' ? new Date(projectData.updatedAt * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : undefined,
          documentsCount: documentsData.documents.length
        })

        // Build project history
        const history: ProjectHistory[] = []

        // Add company creation event
        history.push({
          date: new Date(companyData.created_at * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          title: 'Company Created',
          icon: <FiGlobe className="w-5 h-5 text-gray-900" />
        })

        // Add project creation event
        history.push({
          date: new Date(projectData.createdAt * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          title: 'Project Created',
          icon: <FiFileText className="w-5 h-5 text-gray-900" />
        })

        // Add team members joined events
        if (teamData.length > 0) {
          // Sort team members by creation date
          const sortedTeam = [...teamData].sort((a, b) => b.created_at - a.created_at)
          history.push({
            date: new Date(sortedTeam[0].created_at * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            title: `${teamData.length} Team Member${teamData.length === 1 ? '' : 's'} Added`,
            icon: <FiMessageSquare className="w-5 h-5 text-gray-900" />
          })
        }

        // Add status change event if project was submitted
        if (projectData.status === 'submitted') {
          history.push({
            date: new Date(projectData.updatedAt * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            title: 'Project Submitted',
            icon: <FiFileText className="w-5 h-5 text-gray-900" />
          })
        }

        // Add document history
        if (documentsData.documents.length > 0) {
          // Sort documents by createdAt timestamp
          const sortedDocs = [...documentsData.documents].sort((a, b) => b.createdAt - a.createdAt)
          
          // Add most recent document activity
          history.push({
            date: new Date(sortedDocs[0].createdAt * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            title: `${documentsData.documents.length} Document${documentsData.documents.length === 1 ? '' : 's'} Uploaded`,
            icon: <FiFileText className="w-5 h-5 text-gray-900" />
          })

          // Add individual document uploads
          sortedDocs.forEach(doc => {
            history.push({
              date: new Date(doc.createdAt * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              title: `Document Uploaded: ${doc.name}`,
              icon: <FiFileText className="w-5 h-5 text-gray-900" />
            })
          })
        }

        // Add comments history
        const commentCount = commentsData.comments.length
        if (commentCount > 0) {
          // Add overall comment count
          history.push({
            date: new Date(Math.max(...commentsData.comments.map(c => c.createdAt)) * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            title: `${commentCount} Comment${commentCount === 1 ? '' : 's'} Added`,
            icon: <FiMessageSquare className="w-5 h-5 text-gray-900" />
          })

          // Add individual comments
          const sortedComments = [...commentsData.comments].sort((a, b) => b.createdAt - a.createdAt)
          sortedComments.forEach(comment => {
            history.push({
              date: new Date(comment.createdAt * 1000).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }),
              title: comment.resolved ? 'Comment Resolved' : 'New Comment Added',
              icon: <FiMessageSquare className="w-5 h-5 text-gray-900" />
            })
          })
        }

        // Sort all history items by date (most recent first)
        history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        setProjectHistory(history)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [accessToken, projectId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!company) {
    return <div>Company not found</div>
  }

  return (
    <Stack gap="lg">
      {/* Header */}
      <div className="flex items-center w-full justify-between">
        <h1 className="text-2xl font-bold">Project overview</h1>
        <div className="flex gap-4">
          {!wallet.connected ? (
            <button
              onClick={() => wallet.select('Suiet')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              Connect Wallet
            </button>
          ) : (
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isSendingFunds || !company.wallet_address}
              title={!company.wallet_address ? "Company hasn't set up their wallet address" : ""}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiDollarSign className="w-4 h-4" />
              {isSendingFunds ? 'Sending...' : 'Fund Project'}
            </button>
          )}
          <Link 
            to={`/admin/projects/${projectId}/review`}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800"
          >
            View project
          </Link>
        </div>
      </div>

      <FundingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFundProject}
        isLoading={isSendingFunds}
      />

      {/* Main Layout */}
      <div className="flex gap-6">
        {/* Left Column */}
        <div className="flex-1">
          {/* Project Stats */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm text-gray-500">Project name</h3>
              <p className="mt-1 font-medium">{company.name}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm text-gray-500">Status</h3>
              <p className="mt-1 font-medium capitalize">{projectStats?.status || 'Unknown'}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm text-gray-500">Date submitted</h3>
              <p className="mt-1 font-medium">{projectStats?.submittedDate || 'Not submitted'}</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm text-gray-500">Documents uploaded</h3>
              <p className="mt-1 font-medium">{projectStats?.documentsCount || 0} documents</p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-sm text-gray-500">Team members</h3>
              <div className="mt-2 flex -space-x-1">
                {teamMembers.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="relative group"
                  >
                    <div 
                      className="w-6 h-6 rounded-full bg-gray-800 border-2 border-white flex items-center justify-center text-xs text-white font-medium"
                      title={`${member.firstName} ${member.lastName}`}
                    >
                      {member.firstName?.[0]?.toUpperCase()}
                    </div>
                    
                    {/* Hover tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 hidden group-hover:block">
                      <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3">
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-gray-300 text-xs mt-1">{member.title}</p>
                        {member.linkedin && (
                          <a 
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer" 
                            className="text-blue-400 hover:text-blue-300 mt-1 block"
                          >
                            LinkedIn Profile
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {teamMembers.length > 3 && (
                  <div 
                    className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600"
                    title={`${teamMembers.length - 3} more team members`}
                  >
                    +{teamMembers.length - 3}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Summary of project & company</h2>
            <p className="text-gray-600">
              {company.description || 'No description available.'}
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <span>This description was generated by AI</span>
              <button className="ml-2 text-gray-400 hover:text-gray-600">
                ⓘ
              </button>
            </div>
          </div>

          {/* Valuation & Industries */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Projected valuation</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">$2.5M - $3.2M</p>
                    <p className="text-sm text-gray-500">Estimated range</p>
                  </div>
                  <FiDollarSign className="w-8 h-8 text-gray-900" />
                </div>
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="w-4 h-4 text-gray-900" />
                  <span className="text-sm text-gray-600">+15% from initial estimate</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Similar industries</h2>
              <div className="space-y-3">
                {company.stages.map((stage, index) => (
                  <div key={stage} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage}</span>
                    <span className="text-sm text-gray-500">{85 - (index * 10)}% match</span>
                  </div>
                ))}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Can you tell idk</span>
                  <span className="text-sm text-gray-500">what actually goes here</span>
                </div>
              </div>
            </div>
          </div>

          {/* Online Presence */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4">Online presence</h2>
            <div className="space-y-4">
              {company.website && (
                <div className="flex items-center gap-4">
                  <FiGlobe className="w-5 h-5 text-gray-500" />
                  <div>
                    <a href={company.website} className="text-gray-900 hover:text-gray-600">{company.website}</a>
                    <p className="text-sm text-gray-500">Main website</p>
                  </div>
                </div>
              )}
              {company.linkedin_url && (
                <div className="flex items-center gap-4">
                  <FiLinkedin className="w-5 h-5 text-gray-500" />
                  <div>
                    <a href={company.linkedin_url} className="text-gray-900 hover:text-gray-600">{company.linkedin_url}</a>
                    <p className="text-sm text-gray-500">2,500+ followers</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Project History Sidebar */}
        <div className="w-80">
          <div className="bg-white rounded-lg border border-gray-200 p-6 h-full">
            <h2 className="text-lg font-semibold mb-4">Project History</h2>
            <div className="space-y-6">
              {projectHistory.map((item, index) => (
                <HistoryItem 
                  key={index}
                  date={item.date}
                  title={item.title}
                  icon={item.icon}
                />
              ))}
              {projectHistory.length === 0 && (
                <p className="text-sm text-gray-500">No history available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Stack>
  )
}

interface HistoryItemProps {
  date: string
  title: string
  icon: React.ReactNode
}

function HistoryItem({ date, title, icon }: HistoryItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-500">{date}</p>
      <div className="mt-1 flex items-center gap-2">
        {icon}
        <p className="text-sm font-medium">{title}</p>
      </div>
    </div>
  )
} 
