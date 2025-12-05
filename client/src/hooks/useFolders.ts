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

  return {
    createFolder: createFolderMutation.mutate,
    isCreating: createFolderMutation.isPending,
  };
};
