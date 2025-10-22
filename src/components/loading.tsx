'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className = '' }: LoadingSkeletonProps) {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i}
          className="h-4 w-full" 
          style={{ width: `${Math.random() * 40 + 60}%` }} 
        />
      ))}
    </div>
  );
}

interface LoadingProps {
  message?: string;
  fullscreen?: boolean;
}

export function Loading({ message = 'Loading...', fullscreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center p-4 space-y-4">
      <div className="relative">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

interface LoadingOverlayProps {
  loading: boolean;
  message?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ loading, message, children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <Loading message={message} />
        </div>
      )}
    </div>
  );
}

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  [key: string]: any; // For spreading other button props
}

export function LoadingButton({ loading, children, ...props }: LoadingButtonProps) {
  return (
    <button
      disabled={loading}
      className="relative inline-flex items-center justify-center"
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
        </div>
      )}
      <span className={loading ? 'invisible' : 'visible'}>
        {children}
      </span>
    </button>
  );
}