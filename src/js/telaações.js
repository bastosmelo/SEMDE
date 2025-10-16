        const modal = document.getElementById('modalNovaAcao');
        const btnNovaAcao = document.querySelector('.btn-primary');
        const btnClose = document.querySelector('.close');
        const btnCancelar = document.getElementById('btnCancelar');
        const form = document.getElementById('formNovaAcao');

        btnNovaAcao.addEventListener('click', function() {
            modal.style.display = 'block';
        });

        function fecharModal() {
            modal.style.display = 'none';
            form.reset();
        }

        btnClose.addEventListener('click', fecharModal);
        btnCancelar.addEventListener('click', fecharModal);

        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                fecharModal();
            }
        });

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const novaAcao = {
                cidade: formData.get('cidade'),
                bairro: formData.get('bairro'),
                tipoAcao: formData.get('tipoAcao'),
                dataAcao: formatarData(formData.get('dataAcao')),
                descricao: formData.get('descricao'),
                responsavel: formData.get('responsavel'),
                contato: formData.get('contato')
            };

            adicionarLinhaTabela(novaAcao);
            
            fecharModal();
            
            // Mostrar mensagem de sucesso
            alert('Ação criada com sucesso!');
        });

        function formatarData(data) {
            const date = new Date(data);
            return date.toLocaleDateString('pt-BR');
        }

        function adicionarLinhaTabela(acao) {
            const tbody = document.querySelector('.actions-table tbody');
            const novaLinha = document.createElement('tr');
            
            novaLinha.innerHTML = `
                <td>${acao.cidade}</td>
                <td>${acao.bairro}</td>
                <td>${acao.tipoAcao}</td>
                <td>${acao.dataAcao}</td>
                <td class="actions-cell">
                    <button class="btn-icon btn-edit" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-delete" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.insertBefore(novaLinha, tbody.firstChild);
        }

        document.getElementById('contato').addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                if (value.length < 14) {
                    value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                }
            }
            e.target.value = value;
        });