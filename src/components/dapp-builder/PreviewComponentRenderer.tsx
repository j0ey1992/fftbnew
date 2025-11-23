'use client';

import React from 'react';
import { DAppComponent } from '@/types/visual-dapp-builder';
import { componentRegistry } from '@/lib/dapp-builder/component-registry';
import styles from './PreviewComponentRenderer.module.css';

interface PreviewComponentRendererProps {
  component: DAppComponent;
  isSelected?: boolean;
}

export function PreviewComponentRenderer({ component, isSelected }: PreviewComponentRendererProps) {
  const config = componentRegistry[component.componentId];
  
  if (!config) {
    return (
      <div className={styles.unknownComponent}>
        <span className={styles.icon}>❓</span>
        <p>Unknown Component: {component.componentId}</p>
      </div>
    );
  }

  // Get preview content based on component type
  const getPreviewContent = () => {
    switch (component.componentId) {
      case 'nft-staking':
        return (
          <div className={styles.nftStaking}>
            <div className={styles.nftGrid}>
              <div className={styles.nftCard} />
              <div className={styles.nftCard} />
              <div className={styles.nftCard} />
              <div className={styles.nftCard} />
            </div>
            <div className={styles.stakingInfo}>
              <div className={styles.statBox}>
                <span>Total Staked</span>
                <strong>0 NFTs</strong>
              </div>
              <div className={styles.statBox}>
                <span>Rewards</span>
                <strong>0 KRIS</strong>
              </div>
            </div>
          </div>
        );

      case 'token-staking':
      case 'lp-staking':
        return (
          <div className={styles.stakingPool}>
            <div className={styles.poolHeader}>
              <div className={styles.tokenPair}>
                <div className={styles.tokenIcon} />
                <span>{component.componentId === 'lp-staking' ? 'LP Token' : 'KRIS'}</span>
              </div>
              <div className={styles.apr}>APR: 120%</div>
            </div>
            <div className={styles.poolStats}>
              <div className={styles.stat}>
                <span>Total Staked</span>
                <strong>$0</strong>
              </div>
              <div className={styles.stat}>
                <span>Your Stake</span>
                <strong>0</strong>
              </div>
            </div>
            <div className={styles.actionButtons}>
              <button className={styles.button}>Stake</button>
              <button className={styles.buttonSecondary}>Unstake</button>
            </div>
          </div>
        );

      case 'vault-staking':
        return (
          <div className={styles.vault}>
            <div className={styles.vaultHeader}>
              <div className={styles.vaultIcon}>🏦</div>
              <h3>Auto-Compound Vault</h3>
            </div>
            <div className={styles.vaultInfo}>
              <div className={styles.infoRow}>
                <span>APY</span>
                <strong>245.67%</strong>
              </div>
              <div className={styles.infoRow}>
                <span>TVL</span>
                <strong>$1.2M</strong>
              </div>
            </div>
            <button className={styles.buttonPrimary}>Deposit</button>
          </div>
        );

      case 'swap':
        return (
          <div className={styles.swapInterface}>
            <div className={styles.swapBox}>
              <label>From</label>
              <div className={styles.tokenInput}>
                <input type="text" placeholder="0.0" />
                <button className={styles.tokenSelect}>CRO ▼</button>
              </div>
            </div>
            <div className={styles.swapArrow}>⇅</div>
            <div className={styles.swapBox}>
              <label>To</label>
              <div className={styles.tokenInput}>
                <input type="text" placeholder="0.0" />
                <button className={styles.tokenSelect}>KRIS ▼</button>
              </div>
            </div>
            <button className={styles.buttonPrimary}>Swap</button>
          </div>
        );

      case 'quest-discovery':
        return (
          <div className={styles.questGrid}>
            <div className={styles.questCard}>
              <div className={styles.questIcon}>🎯</div>
              <h4>Daily Quest</h4>
              <p>Complete daily tasks</p>
              <div className={styles.xpBadge}>+100 XP</div>
            </div>
            <div className={styles.questCard}>
              <div className={styles.questIcon}>⚔️</div>
              <h4>Battle Quest</h4>
              <p>Win 5 battles</p>
              <div className={styles.xpBadge}>+500 XP</div>
            </div>
          </div>
        );

      case 'leaderboard':
        return (
          <div className={styles.leaderboard}>
            <div className={styles.leaderboardItem}>
              <span className={styles.rank}>1</span>
              <span className={styles.username}>Player1</span>
              <span className={styles.score}>10,000 XP</span>
            </div>
            <div className={styles.leaderboardItem}>
              <span className={styles.rank}>2</span>
              <span className={styles.username}>Player2</span>
              <span className={styles.score}>8,500 XP</span>
            </div>
            <div className={styles.leaderboardItem}>
              <span className={styles.rank}>3</span>
              <span className={styles.username}>Player3</span>
              <span className={styles.score}>7,200 XP</span>
            </div>
          </div>
        );

      case 'connect-wallet':
        return (
          <div className={styles.connectWallet}>
            <button className={styles.walletButton}>
              <span className={styles.walletIcon}>👛</span>
              Connect Wallet
            </button>
          </div>
        );

      case 'token-balance':
        return (
          <div className={styles.tokenBalance}>
            <div className={styles.balanceCard}>
              <div className={styles.tokenIcon} />
              <div className={styles.balanceInfo}>
                <span>KRIS Balance</span>
                <strong>0.00</strong>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className={styles.genericComponent}>
            <span className={styles.componentIcon}>{config.icon}</span>
            <h3>{config.name}</h3>
            <p>{config.description}</p>
          </div>
        );
    }
  };

  return (
    <div 
      className={`${styles.componentPreview} ${isSelected ? styles.selected : ''} ${styles[config.category]}`}
      data-component-type={component.componentId}
    >
      <div className={styles.componentLabel}>
        <span className={styles.labelIcon}>{config.icon}</span>
        <span className={styles.labelText}>{config.name}</span>
      </div>
      
      <div className={styles.componentContent}>
        {getPreviewContent()}
      </div>

      {component.config && Object.keys(component.config).length > 0 && (
        <div className={styles.configIndicator}>
          Configured
        </div>
      )}
    </div>
  );
}