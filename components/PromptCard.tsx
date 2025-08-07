"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, Star, Copy, User, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/lib/supabase";
import { toggleLike, toggleFavorite } from "@/lib/prompts";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PromptCardProps {
  prompt: Prompt;
  onUpdate?: (updatedPrompt: Prompt) => void;
}

export function PromptCard({ prompt, onUpdate }: PromptCardProps) {
  const { isAuthenticated, user } = useAuth();
  const [isLiked, setIsLiked] = useState(prompt.is_liked || false);
  const [isFavorited, setIsFavorited] = useState(prompt.is_favorited || false);
  const [likesCount, setLikesCount] = useState(prompt.likes_count);
  const [favoritesCount, setFavoritesCount] = useState(prompt.favorites_count);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.content);
      toast.success("已复制到剪贴板");
    } catch (error) {
      toast.error("复制失败");
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      return;
    }

    setLoading(true);
    try {
      const newLikedState = await toggleLike(prompt.id, user!.id);
      setIsLiked(newLikedState);
      setLikesCount((prev) => (newLikedState ? prev + 1 : prev - 1));

      if (onUpdate) {
        onUpdate({
          ...prompt,
          is_liked: newLikedState,
          likes_count: newLikedState ? likesCount + 1 : likesCount - 1,
        });
      }
    } catch (error) {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("请先登录");
      return;
    }

    setLoading(true);
    try {
      const newFavoritedState = await toggleFavorite(prompt.id, user!.id);
      setIsFavorited(newFavoritedState);
      setFavoritesCount((prev) => (newFavoritedState ? prev + 1 : prev - 1));

      if (onUpdate) {
        onUpdate({
          ...prompt,
          is_favorited: newFavoritedState,
          favorites_count: newFavoritedState
            ? favoritesCount + 1
            : favoritesCount - 1,
        });
      }
    } catch (error) {
      toast.error("操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 border-0 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div
                onClick={() => setIsDialogOpen(true)}
                className="cursor-pointer"
              >
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                  {prompt.title}
                </h3>
              </div>
              {prompt.categorieslabel && (
                <Badge
                  variant="secondary"
                  className="text-xs"
                  style={{
                    backgroundColor: `${prompt.categorieslabel.color}15`,
                    color: prompt.categorieslabel.color,
                    border: `1px solid ${prompt.categorieslabel.color}30`,
                  }}
                >
                  {prompt.categorieslabel.name}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div onClick={() => setIsDialogOpen(true)} className="cursor-pointer">
            <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4 group-hover:text-gray-800 transition-colors">
              {prompt.content}
            </p>
          </div>

          {/* Author Info */}
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Avatar className="h-5 w-5">
              <AvatarImage src={prompt.user_profiles?.avatar_url} />
              <AvatarFallback className="text-xs">
                {prompt.user_profiles?.display_name?.[0]?.toUpperCase() ||
                  prompt.user_profiles?.username?.[0]?.toUpperCase() ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <span>
              {prompt.user_profiles?.display_name ||
                prompt.user_profiles?.username}
            </span>
            <span>•</span>
            <span>
              {new Date(prompt.created_at).toLocaleDateString("zh-CN")}
            </span>
          </div>
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Heart className="h-4 w-4" />
              <span>{likesCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4" />
              <span>{favoritesCount}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-2 hover:bg-gray-100"
            >
              <Copy className="h-4 w-4" />
            </Button>

            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={loading}
                  className={cn(
                    "h-8 px-2 hover:bg-red-50 hover:text-red-600",
                    isLiked && "text-red-600 bg-red-50"
                  )}
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavorite}
                  disabled={loading}
                  className={cn(
                    "h-8 px-2 hover:bg-yellow-50 hover:text-yellow-600",
                    isFavorited && "text-yellow-600 bg-yellow-50"
                  )}
                >
                  <Star
                    className={cn("h-4 w-4", isFavorited && "fill-current")}
                  />
                </Button>
              </>
            )}
          </div>
        </CardFooter>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {prompt.title}
            </DialogTitle>
            {prompt.categorieslabel && (
              <Badge
                variant="secondary"
                className="text-xs mt-2 w-fit"
                style={{
                  backgroundColor: `${prompt.categorieslabel.color}15`,
                  color: prompt.categorieslabel.color,
                  border: `1px solid ${prompt.categorieslabel.color}30`,
                }}
              >
                {prompt.categorieslabel.name}
              </Badge>
            )}
          </DialogHeader>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 p-4 bg-gray-50 rounded-md">
              {prompt.content}
            </pre>
          </div>

          <DialogFooter className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Avatar className="h-6 w-6">
                <AvatarImage src={prompt.user_profiles?.avatar_url} />
                <AvatarFallback className="text-xs">
                  {prompt.user_profiles?.display_name?.[0]?.toUpperCase() ||
                    prompt.user_profiles?.username?.[0]?.toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <span>
                {prompt.user_profiles?.display_name ||
                  prompt.user_profiles?.username}
              </span>
              <span>•</span>
              <span>
                {new Date(prompt.created_at).toLocaleDateString("zh-CN")}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleCopy}
                className="flex items-center space-x-1"
              >
                <Copy className="h-4 w-4 mr-1" />
                <span>复制</span>
              </Button>

              {isAuthenticated && (
                <>
                  <Button
                    variant="outline"
                    onClick={handleLike}
                    disabled={loading}
                    className={cn(
                      "flex items-center space-x-1",
                      isLiked && "text-red-600 border-red-200 bg-red-50"
                    )}
                  >
                    <Heart
                      className={cn("h-4 w-4 mr-1", isLiked && "fill-current")}
                    />
                    <span>{isLiked ? "已点赞" : "点赞"}</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleFavorite}
                    disabled={loading}
                    className={cn(
                      "flex items-center space-x-1",
                      isFavorited &&
                        "text-yellow-600 border-yellow-200 bg-yellow-50"
                    )}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4 mr-1",
                        isFavorited && "fill-current"
                      )}
                    />
                    <span>{isFavorited ? "已收藏" : "收藏"}</span>
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
