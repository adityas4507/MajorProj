import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { foldersApi } from '../api/folders';

export const useFolders = (folderId?: string) => {
  const queryClient = useQueryClient();

  const createFolderMutation = useMutation({
    mutationFn: (name: string) => foldersApi.create(name, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      toast.success('Folder created');
    },
    onError: () => toast.error('Failed to create folder'),
  });

  const renameFolderMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => foldersApi.rename(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      toast.success('Folder renamed');
    },
    onError: () => toast.error('Failed to rename folder'),
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id: string) => foldersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', folderId] });
      toast.success('Folder deleted');
    },
    onError: () => toast.error('Failed to delete folder'),
  });

  return {
    createFolder: createFolderMutation.mutate,
    isCreating: createFolderMutation.isPending,
    renameFolder: renameFolderMutation.mutate,
    deleteFolder: deleteFolderMutation.mutate,
  };
};
