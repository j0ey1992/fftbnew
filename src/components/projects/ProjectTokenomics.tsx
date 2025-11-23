'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { FaCoins, FaChartPie, FaExternalLinkAlt, FaCopy } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectTokenomicsProps {
  tokenInfo?: {
    symbol: string;
    address: string;
    chain: number;
  };
}

export function ProjectTokenomics({ tokenInfo }: ProjectTokenomicsProps) {
  if (!tokenInfo) {
    return (
      <GlassCard className="p-12 text-center">
        <FaCoins className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Token Information</h3>
        <p className="text-gray-400">
          Token information will be updated once available.
        </p>
      </GlassCard>
    );
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(tokenInfo.address);
    toast.success('Token address copied!');
  };

  // Example tokenomics data - would come from project data
  const tokenomicsData = {
    labels: ['Public Sale', 'Team', 'Treasury', 'Liquidity', 'Marketing', 'Rewards'],
    datasets: [
      {
        data: [40, 15, 20, 10, 5, 10],
        backgroundColor: [
          '#3B82F6', // Blue
          '#8B5CF6', // Purple
          '#10B981', // Green
          '#F59E0B', // Yellow
          '#EF4444', // Red
          '#EC4899', // Pink
        ],
        borderColor: '#1F2937',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#9CA3AF',
          padding: 20,
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#D1D5DB',
        borderColor: '#374151',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `${context.label}: ${context.parsed}%`;
          },
        },
      },
    },
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Tokenomics</h2>
        <p className="text-gray-400">
          Understanding the {tokenInfo.symbol} token distribution
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Token Info */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Token Information</h3>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm text-gray-400">Symbol</span>
              <div className="text-2xl font-bold">{tokenInfo.symbol}</div>
            </div>
            
            <div>
              <span className="text-sm text-gray-400">Contract Address</span>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-white/5 px-3 py-2 rounded flex-1 overflow-hidden text-ellipsis">
                  {tokenInfo.address}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyAddress}
                  className="flex-shrink-0"
                >
                  <FaCopy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-gray-400">Network</span>
              <div className="font-medium">
                {tokenInfo.chain === 25 ? 'Cronos' : `Chain ID: ${tokenInfo.chain}`}
              </div>
            </div>
            
            <div className="pt-4 flex gap-3">
              <a
                href={`https://cronoscan.com/token/${tokenInfo.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="primary" size="sm">
                  View on Explorer
                  <FaExternalLinkAlt className="w-3 h-3 ml-2" />
                </Button>
              </a>
              <Button variant="secondary" size="sm">
                Add to Wallet
              </Button>
            </div>
          </div>
        </GlassCard>

        {/* Distribution Chart */}
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold mb-6">Token Distribution</h3>
          <div className="h-64">
            <Doughnut data={tokenomicsData} options={chartOptions} />
          </div>
        </GlassCard>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <GlassCard className="p-6">
          <h4 className="font-semibold mb-2">Total Supply</h4>
          <div className="text-2xl font-bold">1,000,000,000</div>
          <div className="text-sm text-gray-400">Fixed Supply</div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <h4 className="font-semibold mb-2">Circulating Supply</h4>
          <div className="text-2xl font-bold">400,000,000</div>
          <div className="text-sm text-gray-400">40% of Total</div>
        </GlassCard>
        
        <GlassCard className="p-6">
          <h4 className="font-semibold mb-2">Market Cap</h4>
          <div className="text-2xl font-bold">$12.5M</div>
          <div className="text-sm text-gray-400">Fully Diluted: $31.25M</div>
        </GlassCard>
      </div>
    </div>
  );
}