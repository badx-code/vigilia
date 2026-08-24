set -e
cat etapa1.sh | grep -v "echo" > /tmp/test1.sh
cat etapa2.sh | grep -v "echo" > /tmp/test2.sh
cat etapa3.sh | grep -v "python3" > /tmp/test3.sh

bash /tmp/test1.sh
bash /tmp/test2.sh
bash /tmp/test3.sh

python3 -c "
with open('/tmp/deploy_preview.py') as f:
    code = f.read()
print('Reassembled size:', len(code))
"
